import React from 'react';
import { PressableProps, TextInputProps, TouchableWithoutFeedbackProps } from 'react-native';
import { Logger } from '../logger';
export type TrackedElementData = {
    ref: React.RefObject<any>;
    onPress?: TouchableWithoutFeedbackProps['onPress'] | PressableProps['onPress'];
    onLongPress?: TouchableWithoutFeedbackProps['onLongPress'] | PressableProps['onLongPress'];
    onChangeText?: TextInputProps['onChangeText'];
};
export declare const get: (ID: string) => TrackedElementData | undefined;
export declare const add: (logger: Logger, ID: string, data: TrackedElementData) => void;
