import { SOCKET_TEST_ACTION, SOCKET_TEST_REQUEST_VALUE } from '../websocketTypes';
import { Logger } from '../logger';
import { TrackedElementData } from './trackedElements';
/**
 * This function handles the individual actions that are requested in the jest tests.
 * For each action, we first check that we have the method and value required to perform the action.
 * Then we perform it, normally by calling the callback being used for a specific element prop,
 * or by calling a method on the element's ref.
 * The thrown error message will be displayed in the jest test results.
 */
export declare const handleAction: (logger: Logger, testID: string, element: TrackedElementData, action: SOCKET_TEST_ACTION, value?: SOCKET_TEST_REQUEST_VALUE) => void;
