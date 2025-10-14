"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../logger");
const jest_websocket_mock_1 = __importDefault(require("jest-websocket-mock"));
const constants_1 = require("../constants");
const constants_2 = require("./constants");
describe('websocket.ts', () => {
    const logger = new logger_1.Logger(false);
    const onMessage = jest.fn();
    beforeEach(() => {
        onMessage.mockClear();
    });
    afterEach(() => {
        jest_websocket_mock_1.default.clean();
    });
    it('should connect to the WS server and receive messages on iOS', async () => {
        const server = new jest_websocket_mock_1.default(`ws://${constants_2.IOS_WS_HOST}:${constants_1.WEBSOCKET_PORT}`);
        await require('./websocket').initWebSocket(logger, 'ios', onMessage);
        await server.connected;
        server.send('data');
        expect(onMessage).toHaveBeenCalledWith('data');
    });
    it('should connect to the WS server and receive messages on Android', async () => {
        const server = new jest_websocket_mock_1.default(`ws://${constants_2.ANDROID_WS_HOST}:${constants_1.WEBSOCKET_PORT}`);
        await require('./websocket').initWebSocket(logger, 'android', onMessage);
        await server.connected;
        server.send('data');
        expect(onMessage).toHaveBeenCalledWith('data');
    });
    it('should reject when failing to connect to a WS server', async () => {
        await expect(require('./websocket').initWebSocket(logger, 'ios', onMessage)).rejects.toBeTruthy();
    });
});
