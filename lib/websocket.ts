import WebSocket from 'ws';
import { WEBSOCKET_PORT } from './constants';

import { Logger } from './logger';

export const startWebSocketServer = async (
  logger: Logger,
  port: number = WEBSOCKET_PORT
): Promise<WebSocket.Server> => {
  const wss = new WebSocket.Server({ port });

  return new Promise((resolve) => {
    wss.on('connection', (ws) => {
      ws.on('message', (message) => {
        logger.info(
          `[OWL - WebSocket] The server received a message: ${message.toString()}`
        );

        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
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
      const resolvedPort =
        typeof address === 'object' && address !== null
          ? address.port
          : wss.options.port;

      logger.info(`[OWL - WebSocket] Listening on port ${resolvedPort}.`);

      return resolve(wss);
    });
  });
};

export const createWebSocketClient = async (
  logger: Logger,
  onMessage: (message: string) => void,
  port: number = WEBSOCKET_PORT,
  host: string = 'localhost'
): Promise<WebSocket> => {
  const wsClient = new WebSocket(`ws://${host}:${port}`);

  return new Promise((resolve) => {
    wsClient.on('open', () => resolve(wsClient));

    wsClient.on('message', (message) => {
      logger.info(
        `[OWL - WebSocket] The client received a message: ${message.toString()}.`
      );

      onMessage(message.toString());
    });
  });
};
