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
const actions_1 = require("./actions");
const websocket = __importStar(require("./websocket"));
describe('actions.ts', () => {
    let onMessageCallback;
    const send = jest.fn();
    const close = jest.fn();
    jest.spyOn(websocket, 'createWebSocketClient').mockImplementation(
    // @ts-ignore
    (logger, onMessage, _port, _host) => {
        onMessageCallback(onMessage);
        return Promise.resolve({ send, close });
    });
    beforeEach(() => {
        jest.clearAllMocks();
        onMessageCallback = (onMessage) => {
            setTimeout(() => onMessage(JSON.stringify({
                type: 'DONE',
            })));
        };
    });
    describe('general onMessage handling', () => {
        it('resolves when client sends DONE', async () => {
            await (0, actions_1.press)('testID');
            expect(send).toHaveBeenCalledWith(JSON.stringify({ type: 'ACTION', action: 'PRESS', testID: 'testID' }));
            expect(close).toHaveBeenCalledTimes(1);
        });
        it('rejects when client sends NOT_FOUND', async () => {
            onMessageCallback = (onMessage) => {
                setTimeout(() => onMessage(JSON.stringify({
                    type: 'NOT_FOUND',
                    testID: 'testID',
                })));
            };
            expect(async () => {
                await (0, actions_1.press)('testID');
            }).rejects.toBeTruthy();
        });
        it('rejects when client sends ERROR', async () => {
            onMessageCallback = (onMessage) => {
                setTimeout(() => onMessage(JSON.stringify({
                    type: 'ERROR',
                    testID: 'testID',
                })));
            };
            expect(async () => {
                await (0, actions_1.press)('testID');
            }).rejects.toBeTruthy();
        });
        it('rejects when client sends an unknown event', async () => {
            onMessageCallback = (onMessage) => {
                setTimeout(() => onMessage(JSON.stringify({
                    type: 'UNKNOWN',
                    testID: 'testID',
                })));
            };
            expect(async () => {
                await (0, actions_1.press)('testID');
            }).rejects.toBeTruthy();
        });
    });
    describe('actions', () => {
        it('sends press event', async () => {
            await (0, actions_1.press)('testID');
            expect(send).toHaveBeenCalledWith(JSON.stringify({ type: 'ACTION', action: 'PRESS', testID: 'testID' }));
        });
        it('sends longPress event', async () => {
            await (0, actions_1.longPress)('testID');
            expect(send).toHaveBeenCalledWith(JSON.stringify({
                type: 'ACTION',
                action: 'LONG_PRESS',
                testID: 'testID',
            }));
        });
        it('sends changeText event', async () => {
            await (0, actions_1.changeText)('testID', 'text');
            expect(send).toHaveBeenCalledWith(JSON.stringify({
                type: 'ACTION',
                action: 'CHANGE_TEXT',
                testID: 'testID',
                value: 'text',
            }));
        });
        it('sends scrollTo event', async () => {
            await (0, actions_1.scrollTo)('testID', { y: 10 });
            expect(send).toHaveBeenCalledWith(JSON.stringify({
                type: 'ACTION',
                action: 'SCROLL_TO',
                testID: 'testID',
                value: { y: 10 },
            }));
        });
        it('sends scrollToEnd event', async () => {
            await (0, actions_1.scrollToEnd)('testID');
            expect(send).toHaveBeenCalledWith(JSON.stringify({
                type: 'ACTION',
                action: 'SCROLL_TO_END',
                testID: 'testID',
            }));
        });
        it('sends toExist event', async () => {
            await (0, actions_1.toExist)('testID');
            expect(send).toHaveBeenCalledWith(JSON.stringify({
                type: 'LAYOUT',
                action: 'EXISTS',
                testID: 'testID',
            }));
        });
    });
});
