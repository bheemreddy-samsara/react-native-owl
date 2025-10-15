"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWebSocketClient = exports.startWebSocketServer = void 0;
const ws_1 = __importDefault(require("ws"));
const constants_1 = require("./constants");
const startWebSocketServer = async (logger, port = constants_1.WEBSOCKET_PORT) => {
    const wss = new ws_1.default.Server({ port });
    return new Promise((resolve) => {
        wss.on('connection', (ws) => {
            ws.on('message', (message) => {
                logger.info(`[OWL - WebSocket] The server received a message: ${message.toString()}`);
                wss.clients.forEach((client) => {
                    if (client !== ws && client.readyState === ws_1.default.OPEN) {
                        client.send(message.toString());
                    }
                });
            });
            ws.on('error', (error) => {
                logger.error(`[OWL - WebSocket] Error:`, error);
            });
        });
        wss.on('listening', () => {
            const address = wss.address();
            const resolvedPort = typeof address === 'object' && address !== null
                ? address.port
                : wss.options.port;
            logger.info(`[OWL - WebSocket] Listening on port ${resolvedPort}.`);
            return resolve(wss);
        });
    });
};
exports.startWebSocketServer = startWebSocketServer;
const createWebSocketClient = async (logger, onMessage, port = constants_1.WEBSOCKET_PORT, host = 'localhost') => {
    const wsClient = new ws_1.default(`ws://${host}:${port}`);
    return new Promise((resolve) => {
        wsClient.on('open', () => resolve(wsClient));
        wsClient.on('message', (message) => {
            logger.info(`[OWL - WebSocket] The client received a message: ${message.toString()}.`);
            onMessage(message.toString());
        });
    });
};
exports.createWebSocketClient = createWebSocketClient;
