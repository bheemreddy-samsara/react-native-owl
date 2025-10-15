import { Logger } from './logger';
import { Platform } from './types';
export declare const cleanupReport: () => Promise<void>;
export declare const generateReport: (logger: Logger, platform: Platform) => Promise<void>;
