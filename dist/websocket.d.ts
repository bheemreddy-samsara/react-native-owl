import WebSocket from 'ws';
import { Logger } from './logger';
export declare const startWebSocketServer: (logger: Logger, port?: number) => Promise<WebSocket.Server>;
export declare const createWebSocketClient: (logger: Logger, onMessage: (message: string) => void, port?: number, host?: string) => Promise<WebSocket>;
