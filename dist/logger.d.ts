export declare class Logger {
    isEnabled: boolean;
    constructor(isEnabled?: boolean);
    /** Will only output when the debug flag in the config is on. */
    info(message?: any, ...optionalParams: any[]): void;
    /** Will only output when the debug flag in the config is on. */
    warn(message?: any, ...optionalParams: any[]): void;
    /** Will only output when the debug flag in the config is on. */
    error(message?: any, ...optionalParams: any[]): void;
    /** Will always print output to the terminal - not depending on the debug flag. */
    print(message?: any, ...optionalParams: any[]): void;
}
