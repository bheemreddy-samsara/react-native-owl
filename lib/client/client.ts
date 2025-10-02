import React from 'react';
import { Platform } from 'react-native';
import { Logger } from '../logger';
import {
  CHECK_INTERVAL,
  MAX_CHECK_TIMEOUT,
  SOCKET_WAIT_TIMEOUT,
} from './constants';
import { initWebSocket } from './websocket';
import { SOCKET_CLIENT_RESPONSE, SOCKET_TEST_REQUEST } from '../websocketTypes';

import { add, get, TrackedElementData } from './trackedElements';
import { handleAction } from './handleAction';

const logger = new Logger(true);

let isReactUpdating = true;

let owlClient: WebSocket;

export const initClient = () => {
  logger.info('[OWL - Client] Initialising OWL client');

  patchReact();
  waitForWebSocket();
};

/**
 * Based on an elements props, store element tracking data and return updated props
 */
export const applyElementTracking = (
  props: Record<string, unknown> | undefined,
  isJsx: boolean = false
): {
  [key: string]: unknown;
  ref?: React.RefObject<unknown>;
  showsHorizontalScrollIndicator: boolean;
  showsVerticalScrollIndicator: boolean;
} => {
  const normalizedProps = props ?? {};

  if (isJsx) {
    applyJsxChildrenElementTracking(normalizedProps);
  }

  const testID = (normalizedProps as { testID?: string }).testID;

  const returnProps = {
    ...normalizedProps,
    showsHorizontalScrollIndicator: false as const,
    showsVerticalScrollIndicator: false as const,
  };

  if (!testID) {
    return returnProps;
  }

  const existingTrackedElement = get(testID);

  const ref =
    ((normalizedProps as { ref?: React.RefObject<unknown> }).ref ??
      undefined) ||
    existingTrackedElement?.ref ||
    React.createRef();

  const trackData: TrackedElementData = {
    ref: existingTrackedElement?.ref || ref,
    onPress:
      existingTrackedElement?.onPress ||
      (normalizedProps as { onPress?: TrackedElementData['onPress'] }).onPress,
    onLongPress:
      existingTrackedElement?.onLongPress ||
      (normalizedProps as { onLongPress?: TrackedElementData['onLongPress'] })
        .onLongPress,
    onChangeText:
      existingTrackedElement?.onChangeText ||
      (normalizedProps as {
        onChangeText?: TrackedElementData['onChangeText'];
      }).onChangeText,
  };

  add(logger, testID, trackData);

  return {
    ...returnProps,
    ref,
  };
};

/**
 * To get access to the prop callbacks when the element is created, we need to check the children
 */
export const applyJsxChildrenElementTracking = (
  props: Record<string, unknown>
): void => {
  const children = (props as { children?: unknown }).children;

  if (Array.isArray(children)) {
    children.forEach((child: any) => {
      const testID = child?.props?.testID;

      if (!testID) {
        return;
      }

      const existingTrackedElement = get(testID);
      const childProps = child?.props ?? {};

      const ref =
        (childProps?.ref as React.RefObject<unknown> | undefined) ||
        existingTrackedElement?.ref ||
        React.createRef();

      const trackData: TrackedElementData = {
        ref: existingTrackedElement?.ref || ref,
        onPress: existingTrackedElement?.onPress || childProps?.onPress,
        onLongPress:
          existingTrackedElement?.onLongPress || childProps?.onLongPress,
        onChangeText:
          existingTrackedElement?.onChangeText || childProps?.onChangeText,
      };

      add(logger, testID, trackData);
    });
  }
};

/**
 * We patch react so that we can maintain a list of elements that have testID's
 * We can then use this list to find the element when we receive an action
 */
export const patchReact = () => {
  const originalReactCreateElement: typeof React.createElement =
    React.createElement;
  let automateTimeout: ReturnType<typeof setTimeout> | undefined;

  const scheduleReactUpdateSettled = () => {
    if (automateTimeout) {
      clearTimeout(automateTimeout);
    }

    automateTimeout = setTimeout(() => {
      isReactUpdating = false;
    }, CHECK_INTERVAL);

    isReactUpdating = true;
  };

  const applyTracking = (
    props: Record<string, unknown> | undefined,
    isJsx: boolean
  ) => {
    const newProps = applyElementTracking(props, isJsx);
    scheduleReactUpdateSettled();
    return newProps;
  };

  if (parseInt(React.version.split('.')[0], 10) >= 18) {
    const jsxRuntime = require('react/jsx-runtime');
    const wrapJsxCall = (original: (...args: any[]) => any) =>
      function wrappedJsx(
        type: any,
        config: Record<string, unknown> | undefined,
        maybeKey?: string
      ) {
        return original(type, applyTracking(config, true), maybeKey);
      };

    if (typeof jsxRuntime.jsx === 'function') {
      jsxRuntime.jsx = wrapJsxCall(jsxRuntime.jsx);
    }

    if (typeof jsxRuntime.jsxs === 'function') {
      jsxRuntime.jsxs = wrapJsxCall(jsxRuntime.jsxs);
    }

    if (typeof jsxRuntime.jsxDEV === 'function') {
      jsxRuntime.jsxDEV = wrapJsxCall(jsxRuntime.jsxDEV);
    }
  }

  // @ts-ignore
  React.createElement = (type, props, ...children) => {
    const newProps = applyTracking(props, false);

    return originalReactCreateElement(type, newProps, ...children);
  };
};

/**
 * The app might launch before the OWL server starts, so we need to keep trying...
 */
export const waitForWebSocket = async () => {
  try {
    owlClient = await initWebSocket(
      logger,
      Platform.OS === 'android' ? 'android' : 'ios',
      handleMessage
    );

    logger.info('[OWL - Websocket] Connection established');
  } catch {
    setTimeout(waitForWebSocket, SOCKET_WAIT_TIMEOUT);
  }
};

/**
 * When we receive a message, we need to find the element that corresponds to the testID,
 * then attempt to handle the requested action on it.
 */
export const handleMessage = async (message: string) => {
  const socketEvent = JSON.parse(message) as SOCKET_TEST_REQUEST;
  const testID = socketEvent.testID;

  let element;

  try {
    element = await getElementByTestId(testID);
  } catch (error) {
    sendNotFound(testID);
  }

  if (element) {
    try {
      if (socketEvent.type === 'ACTION') {
        handleAction(
          logger,
          testID,
          element,
          socketEvent.action,
          socketEvent.value
        );

        setTimeout(sendDone, 1000);
      } else {
        sendDone();
      }
    } catch (error) {
      let message = 'Unknown error';
      if (error instanceof Error) {
        message = error.message;
      }

      sendError(testID, message);
    }
  }
};

const sendEvent = (event: SOCKET_CLIENT_RESPONSE) =>
  owlClient.send(JSON.stringify(event));

const sendNotFound = (testID: string) =>
  sendEvent({ type: 'NOT_FOUND', testID });

const sendDone = () => sendEvent({ type: 'DONE' });

const sendError = (testID: string, message: string) =>
  sendEvent({ type: 'ERROR', testID, message });

/**
 * This function resolves the tracked element by its testID, so that we can handle events on it.
 * If the element is not immedietly available, we wait for it to be available for some time.
 */
const getElementByTestId = async (testID: string) =>
  new Promise<TrackedElementData>((resolve, reject) => {
    logger.info(`[OWL - Client] Looking for Element with testID ${testID}`);

    const rejectTimeout = setTimeout(() => {
      logger.error(`[OWL - Client] ❌ not found`);

      clearInterval(checkInterval);
      reject(new Error(`Element with testID ${testID} not found`));
    }, MAX_CHECK_TIMEOUT);

    const checkInterval = setInterval(() => {
      const element = get(testID);
      if (isReactUpdating || !element) {
        return;
      }

      logger.info(`[OWL - Client] ✓ found`);

      clearInterval(checkInterval);
      clearTimeout(rejectTimeout);
      resolve(element);
    }, CHECK_INTERVAL);
  });
