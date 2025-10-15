"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toMatchBaseline = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pixelmatch_1 = __importDefault(require("pixelmatch"));
const pngjs_1 = require("pngjs");
const toMatchBaseline = (latestPath, options = { threshold: 0.1 }) => {
    const platform = process.env.OWL_PLATFORM;
    const screenshotsDir = path_1.default.join(path_1.default.dirname(latestPath), '..', '..');
    const baselinePath = path_1.default.join(screenshotsDir, 'baseline', platform, path_1.default.basename(latestPath));
    if (latestPath === baselinePath) {
        return {
            message: () => 'Generated a fresh baseline, skipping comparison.',
            pass: true,
        };
    }
    try {
        const diffPath = path_1.default.join(screenshotsDir, 'diff', platform, path_1.default.basename(latestPath));
        fs_1.default.mkdirSync(path_1.default.dirname(diffPath), { recursive: true });
        const baselineData = fs_1.default.readFileSync(baselinePath);
        const baselineImage = pngjs_1.PNG.sync.read(baselineData);
        const latestData = fs_1.default.readFileSync(latestPath);
        const latestImage = pngjs_1.PNG.sync.read(latestData);
        const diffImage = new pngjs_1.PNG({
            width: baselineImage.width,
            height: baselineImage.height,
        });
        const diffPixelsCount = (0, pixelmatch_1.default)(baselineImage.data, latestImage.data, diffImage.data, baselineImage.width, baselineImage.height, { threshold: options?.threshold });
        if (diffPixelsCount === 0) {
            return {
                message: () => `Compared screenshot to match baseline. No differences were found.`,
                pass: true,
            };
        }
        // Create and save the diff image
        fs_1.default.writeFileSync(diffPath, pngjs_1.PNG.sync.write(diffImage));
        return {
            message: () => `Compared screenshot to match baseline. ${diffPixelsCount} were different.`,
            pass: diffPixelsCount === 0,
        };
    }
    catch (error) {
        let message = 'Unknown error';
        if (error instanceof Error) {
            message = error.message;
        }
        return {
            message: () => `Screenshot diffing error - ${message}`,
            pass: false,
        };
    }
};
exports.toMatchBaseline = toMatchBaseline;
expect.extend({ toMatchBaseline: exports.toMatchBaseline });
