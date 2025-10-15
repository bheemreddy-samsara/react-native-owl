"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IOS_WS_HOST = exports.ANDROID_WS_HOST = exports.SOCKET_WAIT_TIMEOUT = exports.MAX_CHECK_TIMEOUT = exports.CHECK_INTERVAL = void 0;
exports.CHECK_INTERVAL = 500; // ie. Wait for elements to exist
exports.MAX_CHECK_TIMEOUT = 10 * 1000; // ie. Element 'Not Found'
exports.SOCKET_WAIT_TIMEOUT = 300; // ie. Retry to connect to websocket
exports.ANDROID_WS_HOST = '10.0.2.2';
exports.IOS_WS_HOST = 'localhost';
