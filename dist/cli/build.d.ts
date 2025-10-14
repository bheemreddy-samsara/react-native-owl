import { CliBuildOptions, Config } from '../types';
import { Logger } from '../logger';
export declare const ENTRY_FILE = "./node_modules/react-native-owl/dist/client/index.app.js";
export declare const buildIOS: (config: Config, logger: Logger) => Promise<void>;
export declare const buildAndroid: (config: Config, logger: Logger) => Promise<void>;
export declare const buildHandler: (args: CliBuildOptions) => Promise<void>;
