"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reload = exports.toExist = exports.scrollToEnd = exports.scrollTo = exports.changeText = exports.longPress = exports.press = void 0;
const config_1 = require("./cli/config");
const logger_1 = require("./logger");
const adb_1 = require("./utils/adb");
const wait_for_1 = require("./utils/wait-for");
const xcrun_1 = require("./utils/xcrun");
const websocket_1 = require("./websocket");
const logger = new logger_1.Logger(process.env.OWL_DEBUG === 'true');
const sendEvent = async (event) => new Promise(async (resolve, reject) => {
    // Create a websocket client just for this event request/response cycle.
    const actionsWebSocketClient = await (0, websocket_1.createWebSocketClient)(logger, (message) => {
        // Close this connection
        actionsWebSocketClient.close();
        // The message received here indicates the outcome of the action we sent to the app client
        const event = JSON.parse(message);
        switch (event.type) {
            case 'DONE':
                resolve(true);
                break;
            case 'NOT_FOUND':
                reject(`Element not found: ${event.testID}`);
                break;
            case 'ERROR':
                reject(`Element error: ${event.testID} - ${event.message}`);
                break;
            default:
                reject('Unknown onMessage event type');
                break;
        }
    });
    actionsWebSocketClient.send(JSON.stringify(event));
});
const press = (testID) => sendEvent({ type: 'ACTION', action: 'PRESS', testID });
exports.press = press;
const longPress = (testID) => sendEvent({ type: 'ACTION', action: 'LONG_PRESS', testID });
exports.longPress = longPress;
const changeText = (testID, value) => sendEvent({ type: 'ACTION', action: 'CHANGE_TEXT', testID, value });
exports.changeText = changeText;
const scrollTo = (testID, value) => sendEvent({ type: 'ACTION', action: 'SCROLL_TO', testID, value });
exports.scrollTo = scrollTo;
const scrollToEnd = (testID) => sendEvent({ type: 'ACTION', action: 'SCROLL_TO_END', testID });
exports.scrollToEnd = scrollToEnd;
const toExist = (testID) => sendEvent({ type: 'LAYOUT', action: 'EXISTS', testID });
exports.toExist = toExist;
const reload = async () => {
    const args = global.OWL_CLI_ARGS;
    if (!args) {
        return;
    }
    const config = await (0, config_1.getConfig)(args.config);
    if (args.platform === 'ios') {
        if (!config.ios?.device) {
            return Promise.reject('Missing device name');
        }
        await (0, xcrun_1.xcrunTerminate)({
            debug: config.debug,
            binaryPath: config.ios?.binaryPath,
            device: config.ios.device,
            scheme: config.ios?.scheme,
            configuration: config.ios?.configuration,
        });
        await (0, xcrun_1.xcrunLaunch)({
            debug: config.debug,
            binaryPath: config.ios?.binaryPath,
            device: config.ios.device,
            scheme: config.ios?.scheme,
            configuration: config.ios?.configuration,
        });
        await (0, wait_for_1.waitFor)(1000);
        await (0, xcrun_1.xcrunUi)({
            debug: config.debug,
            device: config.ios.device,
            configuration: config.ios.configuration,
            binaryPath: config.ios.binaryPath,
        });
    }
    if (args.platform === 'android') {
        if (!config.android?.packageName) {
            return Promise.reject('Missing package name');
        }
        await (0, adb_1.adbTerminate)({
            debug: config.debug,
            packageName: config.android.packageName,
        });
        await (0, adb_1.adbLaunch)({
            debug: config.debug,
            packageName: config.android.packageName,
        });
        await (0, wait_for_1.waitFor)(1000);
    }
};
exports.reload = reload;
