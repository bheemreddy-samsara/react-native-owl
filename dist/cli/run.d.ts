import { CliRunOptions, Config } from '../types';
import { Logger } from '../logger';
export declare const runIOS: (config: Config) => Promise<void>;
export declare const restoreIOSUI: (config: Config, logger: Logger) => Promise<void>;
export declare const runAndroid: (config: Config) => Promise<void>;
export declare const runHandler: (args: CliRunOptions) => Promise<void>;
