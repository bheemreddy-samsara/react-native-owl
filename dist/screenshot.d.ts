export declare const cleanupScreenshots: () => Promise<void>;
/**
 * Takes a screenshot from the simulator.
 * @param filename - Required. The filename(excluding the extension) that will be used to save the screenshot. ie. 'homepage'
 * @returns the path to the screenshot.
 */
export declare const takeScreenshot: (filename: string) => Promise<string>;
