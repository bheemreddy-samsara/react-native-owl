import { Logger } from '../logger';
/**
 * Create a connection to the websocket server,
 * and call the onMessage callback when it receives any messages.
 */
export declare const initWebSocket: (logger: Logger, platform: "android" | "ios", onMessage: (message: string) => void) => Promise<WebSocket>;
