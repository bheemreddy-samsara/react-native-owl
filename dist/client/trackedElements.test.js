"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../logger");
const trackedElements_1 = require("./trackedElements");
describe('trackedElements.ts', () => {
    const logger = new logger_1.Logger(false);
    it('should check for and return elements that have been added', () => {
        const testElement = { ref: { current: null } };
        expect((0, trackedElements_1.get)('testId')).toBeFalsy();
        (0, trackedElements_1.add)(logger, 'testId', testElement);
        expect((0, trackedElements_1.get)('testId')).toEqual(testElement);
    });
});
