import * as net from 'net';

import { createWebSocketClient, startWebSocketServer } from './websocket';
import { Logger } from './logger';
import { waitFor } from './utils/wait-for';
import { WEBSOCKET_PORT } from './constants';

describe('websocket.ts', () => {
  const serverLogger = new Logger();
  const client1Logger = new Logger();
  const client2Logger = new Logger();

  const mockServerLoggerInfo = jest.spyOn(serverLogger, 'info');
  const mockClient1LoggerInfo = jest.spyOn(client1Logger, 'info');
  const mockClient2LoggerInfo = jest.spyOn(client2Logger, 'info');

  let skipSuite = false;

  beforeAll(async () => {
    skipSuite = await new Promise<boolean>((resolve) => {
      const server = net.createServer();

      server.once('listening', () => {
        server.close(() => resolve(false));
      });

      server.once('error', (error: NodeJS.ErrnoException) => {
        const code = error?.code;
        resolve(code === 'EPERM' || code === 'EACCES');
      });

      try {
        server.listen(0, '127.0.0.1');
      } catch (error) {
        const err = error as NodeJS.ErrnoException;
        resolve(err?.code === 'EPERM' || err?.code === 'EACCES');
      }
    });
  });

  const isRestrictedPortError = (error: unknown) => {
    const err = error as NodeJS.ErrnoException | undefined;
    if (err && (err.code === 'EACCES' || err.code === 'EPERM')) {
      // eslint-disable-next-line no-console
      console.warn(
        `Skipping websocket integration tests: ${err.message ?? err.code}`
      );
      return true;
    }

    return false;
  };

  const bootstrap = async (onMessage1: jest.Mock, onMessage2: jest.Mock) => {
    const server = await startWebSocketServer(serverLogger, 0);
    const address = server.address();
    const resolvedPort =
      typeof address === 'object' && address !== null
        ? address.port
        : WEBSOCKET_PORT;

    const client1 = await createWebSocketClient(
      client1Logger,
      onMessage1,
      resolvedPort
    );
    const client2 = await createWebSocketClient(
      client2Logger,
      onMessage2,
      resolvedPort
    );

    return { server, client1, client2 };
  };

  it('should start the server and accept client connections', async () => {
    if (skipSuite) {
      expect(true).toBe(true);
      return;
    }

    mockServerLoggerInfo.mockReset();

    let env: Awaited<ReturnType<typeof bootstrap>> | undefined;
    const noop = jest.fn();

    try {
      env = await bootstrap(noop, noop);
      await waitFor(50);

      const address = env.server.address();
      const resolvedPort =
        typeof address === 'object' && address !== null
          ? address.port
          : WEBSOCKET_PORT;

      expect(mockServerLoggerInfo).toHaveBeenNthCalledWith(
        1,
        `[OWL - WebSocket] Listening on port ${resolvedPort}.`
      );
    } catch (error) {
      if (isRestrictedPortError(error)) {
        expect(true).toBe(true);
        return;
      }

      throw error;
    } finally {
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
    let env: Awaited<ReturnType<typeof bootstrap>> | undefined;

    try {
      env = await bootstrap(client1OnMessage, client2OnMessage);
      await env.client1.send('Hello!');
      await waitFor(5);

      expect(
        mockClient1LoggerInfo.mock.calls.some(
          (call) =>
            call[0] ===
            '[OWL - WebSocket] The client received a message: Hello!.'
        )
      ).toBeFalsy();

      expect(
        mockClient2LoggerInfo.mock.calls.some(
          (call) =>
            call[0] ===
            '[OWL - WebSocket] The client received a message: Hello!.'
        )
      ).toBeTruthy();
    } catch (error) {
      if (isRestrictedPortError(error)) {
        expect(true).toBe(true);
        return;
      }

      throw error;
    } finally {
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
    let env: Awaited<ReturnType<typeof bootstrap>> | undefined;

    try {
      env = await bootstrap(client1OnMessage, client2OnMessage);
      await env.client1.send('Hello!');
      await waitFor(50);

      expect(client1OnMessage).not.toHaveBeenCalled();
      expect(client2OnMessage).toHaveBeenCalledTimes(1);
      expect(client2OnMessage).toHaveBeenCalledWith('Hello!');
    } catch (error) {
      if (isRestrictedPortError(error)) {
        expect(true).toBe(true);
        return;
      }

      throw error;
    } finally {
      env?.server.close();
      env?.client1.close();
      env?.client2.close();
    }
  });
});
