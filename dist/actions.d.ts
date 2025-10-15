import { SOCKET_SCROLL_TO_VALUE } from './websocketTypes';
export declare const press: (testID: string) => Promise<unknown>;
export declare const longPress: (testID: string) => Promise<unknown>;
export declare const changeText: (testID: string, value: string) => Promise<unknown>;
export declare const scrollTo: (testID: string, value: SOCKET_SCROLL_TO_VALUE) => Promise<unknown>;
export declare const scrollToEnd: (testID: string) => Promise<unknown>;
export declare const toExist: (testID: string) => Promise<unknown>;
export declare const reload: () => Promise<undefined>;
