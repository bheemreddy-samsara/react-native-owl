"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
    constructor(isEnabled = false) {
        this.isEnabled = isEnabled;
    }
    /** Will only output when the debug flag in the config is on. */
    info(message, ...optionalParams) {
        if (this.isEnabled) {
            console.info(message, ...optionalParams);
        }
    }
    /** Will only output when the debug flag in the config is on. */
    warn(message, ...optionalParams) {
        if (this.isEnabled) {
            console.warn(message, ...optionalParams);
        }
    }
    /** Will only output when the debug flag in the config is on. */
    error(message, ...optionalParams) {
        if (this.isEnabled) {
            console.error(message, ...optionalParams);
        }
    }
    /** Will always print output to the terminal - not depending on the debug flag. */
    print(message, ...optionalParams) {
        console.log(message, ...optionalParams);
    }
}
exports.Logger = Logger;
