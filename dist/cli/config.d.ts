import { Config } from '../types';
export declare const validateSchema: (config: {}) => Promise<Config>;
export declare const readConfigFile: (configPath: string) => Promise<any>;
export declare const getConfig: (configPath: string) => Promise<Config>;
