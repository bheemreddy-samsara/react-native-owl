import { ConfigIOS } from '../types';
export declare const xcrunStatusBar: ({ debug, binaryPath, device, configuration, }: {
    debug?: boolean;
    binaryPath?: ConfigIOS["binaryPath"];
    device: ConfigIOS["device"];
    configuration?: ConfigIOS["configuration"];
}) => Promise<void>;
export declare const xcrunInstall: ({ debug, binaryPath, device, scheme, configuration, }: {
    debug?: boolean;
    binaryPath?: ConfigIOS["binaryPath"];
    device: ConfigIOS["device"];
    scheme?: ConfigIOS["scheme"];
    configuration?: ConfigIOS["configuration"];
}) => Promise<void>;
export declare const xcrunTerminate: ({ debug, binaryPath, device, scheme, configuration, }: {
    debug?: boolean;
    binaryPath?: ConfigIOS["binaryPath"];
    device: ConfigIOS["device"];
    scheme?: ConfigIOS["scheme"];
    configuration?: ConfigIOS["configuration"];
}) => Promise<void>;
export declare const xcrunLaunch: ({ debug, binaryPath, device, scheme, configuration, }: {
    debug?: boolean;
    binaryPath?: ConfigIOS["binaryPath"];
    device: ConfigIOS["device"];
    scheme?: ConfigIOS["scheme"];
    configuration?: ConfigIOS["configuration"];
}) => Promise<void>;
export declare const xcrunUi: ({ debug, binaryPath, device, configuration, }: {
    debug?: boolean;
    binaryPath?: ConfigIOS["binaryPath"];
    device: ConfigIOS["device"];
    configuration?: ConfigIOS["configuration"];
}) => Promise<void>;
export declare const xcrunRestore: ({ debug, binaryPath, device, configuration, }: {
    debug?: boolean;
    binaryPath?: ConfigIOS["binaryPath"];
    device: ConfigIOS["device"];
    configuration?: ConfigIOS["configuration"];
}) => Promise<void>;
