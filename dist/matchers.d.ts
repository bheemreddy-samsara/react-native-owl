declare global {
    namespace jest {
        interface Matchers<R> {
            /** Compares the image passed to the baseline one */
            toMatchBaseline: ({ threshold, }?: {
                threshold?: number;
            }) => CustomMatcherResult;
        }
    }
}
export declare const toMatchBaseline: (latestPath: string, options?: {
    threshold?: number;
}) => {
    message: () => string;
    pass: boolean;
};
