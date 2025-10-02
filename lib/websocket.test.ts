import WebSocket from 'ws';

import { createWebSocketClient, startWebSocketServer } from './websocket';
import { Logger } from './logger';
import { waitFor } from './utils/wait-for';

describe('websocket.ts', () => {
  let wsServer: WebSocket.Server;
  let wsClient1: WebSocket;
  let wsClient2: WebSocket;

  const serverLogger = new Logger();
  const client1Logger = new Logger();
  const client2Logger = new Logger();

  const mockServerLoggerInfo = jest.spyOn(serverLogger, 'info');
  const mockClient1LoggerInfo = jest.spyOn(client1Logger, 'info');
  const mockClient2LoggerInfo = jest.spyOn(client2Logger, 'info');

  let mockClient1OnMessage: jest.Mock;
  let mockClient2OnMessage: jest.Mock;

  beforeEach(async () => {
    mockServerLoggerInfo.mockReset();
    mockClient1LoggerInfo.mockReset();
    mockClient2LoggerInfo.mockReset();
    mockClient1OnMessage = jest.fn();
    mockClient2OnMessage = jest.fn();

    wsServer = await startWebSocketServer(serverLogger);
    wsClient1 = await createWebSocketClient(client1Logger, mockClient1OnMessage);
    wsClient2 = await createWebSocketClient(client2Logger, mockClient2OnMessage);
  });

  afterEach(() => {
    wsServer.close();
    wsClient1.close();
    wsClient2.close();
  });

  it('should start the server and accept client connections', async () => {
    await waitFor(50);

    expect(mockServerLoggerInfo).toHaveBeenNthCalledWith(
      1,
      '[OWL - WebSocket] Listening on port 8123.'
    );
  });

  it('should forward messages to other clients', async () => {
    await wsClient1.send('Hello!');

    await waitFor(5);

    // We are just checking that client1 did not receive the message,
    // and that client2 did.
    // We are not concerned with the order of the logger calls.
    expect(
      mockClient1LoggerInfo.mock.calls.some(
        (call) =>
          call[0] === '[OWL - WebSocket] The client received a message: Hello!.'
      )
    ).toBeFalsy();

    expect(
      mockClient2LoggerInfo.mock.calls.some(
        (call) =>
          call[0] === '[OWL - WebSocket] The client received a message: Hello!.'
      )
    ).toBeTruthy();
  });

  it('should use the onMessage handler', async () => {
    await wsClient1.send('Hello!');

    await waitFor(50);

    // Check that the onMessage callback was used
    expect(mockClient1OnMessage).not.toHaveBeenCalled();
    expect(mockClient2OnMessage).toHaveBeenCalledTimes(1);
    expect(mockClient2OnMessage).toHaveBeenCalledWith('Hello!');
  });
});
