"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitFor = void 0;
/**
 * Waits for the specified amount of time (in milliseconds) before resolving.
 * @param ms: The number of miliseconds the function should wait for.
 */
const waitFor = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
exports.waitFor = waitFor;
