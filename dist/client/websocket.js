"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWebSocket = void 0;
const constants_1 = require("../constants");
const constants_2 = require("./constants");
/**
 * Create a connection to the websocket server,
 * and call the onMessage callback when it receives any messages.
 */
const initWebSocket = (logger, platform, onMessage) => {
    const ipAddress = platform === 'android' ? constants_2.ANDROID_WS_HOST : constants_2.IOS_WS_HOST;
    const ws = new WebSocket(`ws://${ipAddress}:${constants_1.WEBSOCKET_PORT}`);
    return new Promise((resolve, reject) => {
        ws.onopen = () => {
            logger.info('[OWL - Websocket] onopen');
            ws.send('OWL Client Connected!');
            resolve(ws);
        };
        ws.onmessage = (e) => {
            logger.info(`[OWL - Websocket] onmessage: ${e.data}`);
            onMessage(e.data.toString());
        };
        ws.onerror = (event) => {
            const errorMessage = typeof event.message === 'string'
                ? event.message
                : 'Unknown error';
            logger.info(`[OWL - Websocket] onerror: ${errorMessage}`);
        };
        ws.onclose = (event) => {
            const reason = event && typeof event.reason === 'string' && event.reason.length > 0
                ? event.reason
                : 'Connection closed';
            logger.info(`[OWL - Websocket] onclose: ${reason}`);
            reject(new Error(reason));
        };
    });
};
exports.initWebSocket = initWebSocket;
