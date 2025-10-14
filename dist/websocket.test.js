"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const net = __importStar(require("net"));
const websocket_1 = require("./websocket");
const logger_1 = require("./logger");
const wait_for_1 = require("./utils/wait-for");
const constants_1 = require("./constants");
describe('websocket.ts', () => {
    const serverLogger = new logger_1.Logger();
    const client1Logger = new logger_1.Logger();
    const client2Logger = new logger_1.Logger();
    const mockServerLoggerInfo = jest.spyOn(serverLogger, 'info');
    const mockClient1LoggerInfo = jest.spyOn(client1Logger, 'info');
    const mockClient2LoggerInfo = jest.spyOn(client2Logger, 'info');
    let skipSuite = false;
    beforeAll(async () => {
        skipSuite = await new Promise((resolve) => {
            const server = net.createServer();
            server.once('listening', () => {
                server.close(() => resolve(false));
            });
            server.once('error', (error) => {
                const code = error?.code;
                resolve(code === 'EPERM' || code === 'EACCES');
            });
            try {
                server.listen(0, '127.0.0.1');
            }
            catch (error) {
                const err = error;
                resolve(err?.code === 'EPERM' || err?.code === 'EACCES');
            }
        });
    });
    const isRestrictedPortError = (error) => {
        const err = error;
        if (err && (err.code === 'EACCES' || err.code === 'EPERM')) {
            // eslint-disable-next-line no-console
            console.warn(`Skipping websocket integration tests: ${err.message ?? err.code}`);
            return true;
        }
        return false;
    };
    const bootstrap = async (onMessage1, onMessage2) => {
        const server = await (0, websocket_1.startWebSocketServer)(serverLogger, 0);
        const address = server.address();
        const resolvedPort = typeof address === 'object' && address !== null
            ? address.port
            : constants_1.WEBSOCKET_PORT;
        const client1 = await (0, websocket_1.createWebSocketClient)(client1Logger, onMessage1, resolvedPort);
        const client2 = await (0, websocket_1.createWebSocketClient)(client2Logger, onMessage2, resolvedPort);
        return { server, client1, client2 };
    };
    it('should start the server and accept client connections', async () => {
        if (skipSuite) {
            expect(true).toBe(true);
            return;
        }
        mockServerLoggerInfo.mockReset();
        let env;
        const noop = jest.fn();
        try {
            env = await bootstrap(noop, noop);
            await (0, wait_for_1.waitFor)(50);
            const address = env.server.address();
            const resolvedPort = typeof address === 'object' && address !== null
                ? address.port
                : constants_1.WEBSOCKET_PORT;
            expect(mockServerLoggerInfo).toHaveBeenNthCalledWith(1, `[OWL - WebSocket] Listening on port ${resolvedPort}.`);
        }
        catch (error) {
            if (isRestrictedPortError(error)) {
                expect(true).toBe(true);
                return;
            }
            throw error;
        }
        finally {
            env?.server.close();
            env?.client1.close();
            env?.client2.close();
        }
    });
    it('should forward messages to other clients', async () => {
        if (skipSuite) {
            expect(true).toBe(true);
            return;
        }
        mockClient1LoggerInfo.mockReset();
        mockClient2LoggerInfo.mockReset();
        const client1OnMessage = jest.fn();
        const client2OnMessage = jest.fn();
        let env;
        try {
            env = await bootstrap(client1OnMessage, client2OnMessage);
            await env.client1.send('Hello!');
            await (0, wait_for_1.waitFor)(5);
            expect(mockClient1LoggerInfo.mock.calls.some((call) => call[0] ===
                '[OWL - WebSocket] The client received a message: Hello!.')).toBeFalsy();
            expect(mockClient2LoggerInfo.mock.calls.some((call) => call[0] ===
                '[OWL - WebSocket] The client received a message: Hello!.')).toBeTruthy();
        }
        catch (error) {
            if (isRestrictedPortError(error)) {
                expect(true).toBe(true);
                return;
            }
            throw error;
        }
        finally {
            env?.server.close();
            env?.client1.close();
            env?.client2.close();
        }
    });
    it('should use the onMessage handler', async () => {
        if (skipSuite) {
            expect(true).toBe(true);
            return;
        }
        mockClient1LoggerInfo.mockReset();
        mockClient2LoggerInfo.mockReset();
        const client1OnMessage = jest.fn();
        const client2OnMessage = jest.fn();
        let env;
        try {
            env = await bootstrap(client1OnMessage, client2OnMessage);
            await env.client1.send('Hello!');
            await (0, wait_for_1.waitFor)(50);
            expect(client1OnMessage).not.toHaveBeenCalled();
            expect(client2OnMessage).toHaveBeenCalledTimes(1);
            expect(client2OnMessage).toHaveBeenCalledWith('Hello!');
        }
        catch (error) {
            if (isRestrictedPortError(error)) {
                expect(true).toBe(true);
                return;
            }
            throw error;
        }
        finally {
            env?.server.close();
            env?.client1.close();
            env?.client2.close();
        }
    });
});
