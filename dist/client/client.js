"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMessage = exports.waitForWebSocket = exports.patchReact = exports.applyJsxChildrenElementTracking = exports.applyElementTracking = exports.initClient = void 0;
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const logger_1 = require("../logger");
const constants_1 = require("./constants");
const websocket_1 = require("./websocket");
const trackedElements_1 = require("./trackedElements");
const handleAction_1 = require("./handleAction");
const logger = new logger_1.Logger(true);
let isReactUpdating = true;
let owlClient;
const initClient = () => {
    logger.info('[OWL - Client] Initialising OWL client');
    (0, exports.patchReact)();
    (0, exports.waitForWebSocket)();
};
exports.initClient = initClient;
/**
 * Based on an elements props, store element tracking data and return updated props
 */
const applyElementTracking = (props, isJsx = false) => {
    const normalizedProps = props ?? {};
    if (isJsx) {
        (0, exports.applyJsxChildrenElementTracking)(normalizedProps);
    }
    const testID = normalizedProps.testID;
    const returnProps = {
        ...normalizedProps,
        showsHorizontalScrollIndicator: false,
        showsVerticalScrollIndicator: false,
    };
    if (!testID) {
        return returnProps;
    }
    const existingTrackedElement = (0, trackedElements_1.get)(testID);
    const ref = (normalizedProps.ref ??
        undefined) ||
        existingTrackedElement?.ref ||
        react_1.default.createRef();
    const trackData = {
        ref: existingTrackedElement?.ref || ref,
        onPress: existingTrackedElement?.onPress ||
            normalizedProps.onPress,
        onLongPress: existingTrackedElement?.onLongPress ||
            normalizedProps
                .onLongPress,
        onChangeText: existingTrackedElement?.onChangeText ||
            normalizedProps.onChangeText,
    };
    (0, trackedElements_1.add)(logger, testID, trackData);
    return {
        ...returnProps,
        ref,
    };
};
exports.applyElementTracking = applyElementTracking;
/**
 * To get access to the prop callbacks when the element is created, we need to check the children
 */
const applyJsxChildrenElementTracking = (props) => {
    const children = props.children;
    if (Array.isArray(children)) {
        children.forEach((child) => {
            const testID = child?.props?.testID;
            if (!testID) {
                return;
            }
            const existingTrackedElement = (0, trackedElements_1.get)(testID);
            const childProps = child?.props ?? {};
            const ref = childProps?.ref ||
                existingTrackedElement?.ref ||
                react_1.default.createRef();
            const trackData = {
                ref: existingTrackedElement?.ref || ref,
                onPress: existingTrackedElement?.onPress || childProps?.onPress,
                onLongPress: existingTrackedElement?.onLongPress || childProps?.onLongPress,
                onChangeText: existingTrackedElement?.onChangeText || childProps?.onChangeText,
            };
            (0, trackedElements_1.add)(logger, testID, trackData);
        });
    }
};
exports.applyJsxChildrenElementTracking = applyJsxChildrenElementTracking;
/**
 * We patch react so that we can maintain a list of elements that have testID's
 * We can then use this list to find the element when we receive an action
 */
const patchReact = () => {
    const originalReactCreateElement = react_1.default.createElement;
    let automateTimeout;
    const scheduleReactUpdateSettled = () => {
        if (automateTimeout) {
            clearTimeout(automateTimeout);
        }
        automateTimeout = setTimeout(() => {
            isReactUpdating = false;
        }, constants_1.CHECK_INTERVAL);
        isReactUpdating = true;
    };
    const applyTracking = (props, isJsx) => {
        const newProps = (0, exports.applyElementTracking)(props, isJsx);
        scheduleReactUpdateSettled();
        return newProps;
    };
    if (parseInt(react_1.default.version.split('.')[0], 10) >= 18) {
        const jsxRuntime = require('react/jsx-runtime');
        const wrapJsxCall = (original) => function wrappedJsx(type, config, maybeKey) {
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
    react_1.default.createElement = (type, props, ...children) => {
        const newProps = applyTracking(props, false);
        return originalReactCreateElement(type, newProps, ...children);
    };
};
exports.patchReact = patchReact;
/**
 * The app might launch before the OWL server starts, so we need to keep trying...
 */
const waitForWebSocket = async () => {
    try {
        owlClient = await (0, websocket_1.initWebSocket)(logger, react_native_1.Platform.OS === 'android' ? 'android' : 'ios', exports.handleMessage);
        logger.info('[OWL - Websocket] Connection established');
    }
    catch {
        setTimeout(exports.waitForWebSocket, constants_1.SOCKET_WAIT_TIMEOUT);
    }
};
exports.waitForWebSocket = waitForWebSocket;
/**
 * When we receive a message, we need to find the element that corresponds to the testID,
 * then attempt to handle the requested action on it.
 */
const handleMessage = async (message) => {
    const socketEvent = JSON.parse(message);
    const testID = socketEvent.testID;
    let element;
    try {
        element = await getElementByTestId(testID);
    }
    catch (error) {
        sendNotFound(testID);
    }
    if (element) {
        try {
            if (socketEvent.type === 'ACTION') {
                (0, handleAction_1.handleAction)(logger, testID, element, socketEvent.action, socketEvent.value);
                setTimeout(sendDone, 1000);
            }
            else {
                sendDone();
            }
        }
        catch (error) {
            let message = 'Unknown error';
            if (error instanceof Error) {
                message = error.message;
            }
            sendError(testID, message);
        }
    }
};
exports.handleMessage = handleMessage;
const sendEvent = (event) => owlClient.send(JSON.stringify(event));
const sendNotFound = (testID) => sendEvent({ type: 'NOT_FOUND', testID });
const sendDone = () => sendEvent({ type: 'DONE' });
const sendError = (testID, message) => sendEvent({ type: 'ERROR', testID, message });
/**
 * This function resolves the tracked element by its testID, so that we can handle events on it.
 * If the element is not immedietly available, we wait for it to be available for some time.
 */
const getElementByTestId = async (testID) => new Promise((resolve, reject) => {
    logger.info(`[OWL - Client] Looking for Element with testID ${testID}`);
    const rejectTimeout = setTimeout(() => {
        logger.error(`[OWL - Client] ❌ not found`);
        clearInterval(checkInterval);
        reject(new Error(`Element with testID ${testID} not found`));
    }, constants_1.MAX_CHECK_TIMEOUT);
    const checkInterval = setInterval(() => {
        const element = (0, trackedElements_1.get)(testID);
        if (isReactUpdating || !element) {
            return;
        }
        logger.info(`[OWL - Client] ✓ found`);
        clearInterval(checkInterval);
        clearTimeout(rejectTimeout);
        resolve(element);
    }, constants_1.CHECK_INTERVAL);
});
