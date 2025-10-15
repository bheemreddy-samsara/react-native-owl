"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.add = exports.get = void 0;
/**
 * A masic map of tracked elements, that we use to keep track of elements
 * so that we can perform actions on them in future
 */
const trackedElements = {};
const get = (ID) => trackedElements[ID];
exports.get = get;
const add = (logger, ID, data) => {
    trackedElements[ID] = data;
    logger.info(`[OWL - Tracker] Tracking element with ${ID}`);
};
exports.add = add;
