import React from 'react';
export declare const initClient: () => void;
/**
 * Based on an elements props, store element tracking data and return updated props
 */
export declare const applyElementTracking: (props: Record<string, unknown> | undefined, isJsx?: boolean) => {
    [key: string]: unknown;
    ref?: React.RefObject<unknown>;
    showsHorizontalScrollIndicator: boolean;
    showsVerticalScrollIndicator: boolean;
};
/**
 * To get access to the prop callbacks when the element is created, we need to check the children
 */
export declare const applyJsxChildrenElementTracking: (props: Record<string, unknown>) => void;
/**
 * We patch react so that we can maintain a list of elements that have testID's
 * We can then use this list to find the element when we receive an action
 */
export declare const patchReact: () => void;
/**
 * The app might launch before the OWL server starts, so we need to keep trying...
 */
export declare const waitForWebSocket: () => Promise<void>;
/**
 * When we receive a message, we need to find the element that corresponds to the testID,
 * then attempt to handle the requested action on it.
 */
export declare const handleMessage: (message: string) => Promise<void>;
