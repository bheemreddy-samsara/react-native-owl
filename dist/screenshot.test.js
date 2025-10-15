"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const execa_1 = __importDefault(require("execa"));
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const screenshot_1 = require("./screenshot");
const fileExistsHelpers = __importStar(require("./utils/file-exists"));
const SCREENSHOT_FILENAME = 'screen';
describe('screenshot.ts', () => {
    const commandMock = jest.spyOn(execa_1.default, 'command');
    const mkdirMock = jest.spyOn(fs_1.promises, 'mkdir').mockImplementation();
    const writeFileMock = jest.spyOn(fs_1.promises, 'writeFile').mockImplementation();
    const cwdMock = jest
        .spyOn(process, 'cwd')
        .mockReturnValue('/Users/johndoe/Projects/my-project');
    beforeAll(() => {
        delete process.env.OWL_PLATFORM;
        delete process.env.OWL_DEBUG;
        delete process.env.OWL_IOS_SIMULATOR;
    });
    beforeEach(() => {
        commandMock.mockReset();
        mkdirMock.mockReset();
        writeFileMock.mockReset();
    });
    afterAll(() => {
        cwdMock.mockRestore();
    });
    describe('Baseline', () => {
        beforeAll(() => {
            process.env.OWL_UPDATE_BASELINE = 'true';
            process.env.OWL_IOS_SIMULATOR = undefined;
        });
        describe('iOS', () => {
            beforeAll(() => {
                process.env.OWL_PLATFORM = 'ios';
                process.env.OWL_DEBUG = 'false';
                process.env.OWL_IOS_SIMULATOR = 'iPhone Simulator';
            });
            it('should take a screenshot', async () => {
                await (0, screenshot_1.takeScreenshot)(SCREENSHOT_FILENAME);
                expect(commandMock).toHaveBeenCalledWith('xcrun simctl io iPhone\\ Simulator screenshot screen.png', {
                    cwd: path_1.default.join(process.cwd(), '.owl', 'baseline', 'ios'),
                    shell: false,
                    stdio: 'ignore',
                });
                expect(mkdirMock).toHaveBeenNthCalledWith(1, '/Users/johndoe/Projects/my-project/.owl', { recursive: true });
                expect(mkdirMock).toHaveBeenNthCalledWith(2, '/Users/johndoe/Projects/my-project/.owl/baseline/ios', { recursive: true });
            });
        });
        describe('Android', () => {
            beforeAll(() => {
                process.env.OWL_PLATFORM = 'android';
                process.env.OWL_DEBUG = 'false';
            });
            it('should take a screenshot', async () => {
                await (0, screenshot_1.takeScreenshot)(SCREENSHOT_FILENAME);
                expect(commandMock).toHaveBeenCalledWith('adb exec-out screencap -p > screen.png', {
                    cwd: path_1.default.join(process.cwd(), '.owl', 'baseline', 'android'),
                    shell: true,
                    stdio: 'ignore',
                });
                expect(mkdirMock).toHaveBeenNthCalledWith(1, '/Users/johndoe/Projects/my-project/.owl', { recursive: true });
                expect(mkdirMock).toHaveBeenNthCalledWith(2, '/Users/johndoe/Projects/my-project/.owl/baseline/android', { recursive: true });
            });
        });
    });
    describe('Latest', () => {
        beforeAll(() => {
            process.env.OWL_UPDATE_BASELINE = 'false';
        });
        describe('iOS', () => {
            beforeAll(() => {
                process.env.OWL_PLATFORM = 'ios';
                process.env.OWL_DEBUG = 'false';
                process.env.OWL_IOS_SIMULATOR = 'iPhone Simulator';
            });
            it('should take a screenshot', async () => {
                jest
                    .spyOn(fileExistsHelpers, 'fileExists')
                    .mockResolvedValueOnce(true)
                    .mockResolvedValueOnce(true);
                await (0, screenshot_1.takeScreenshot)(SCREENSHOT_FILENAME);
                expect(commandMock).toHaveBeenCalledWith('xcrun simctl io iPhone\\ Simulator screenshot screen.png', {
                    cwd: path_1.default.join(process.cwd(), '.owl', 'latest', 'ios'),
                    shell: false,
                    stdio: 'ignore',
                });
            });
            it('should take a screenshot - baseline does not exist', async () => {
                await (0, screenshot_1.takeScreenshot)(SCREENSHOT_FILENAME);
                expect(commandMock).toHaveBeenCalledWith('xcrun simctl io iPhone\\ Simulator screenshot screen.png', {
                    cwd: path_1.default.join(process.cwd(), '.owl', 'baseline', 'ios'),
                    shell: false,
                    stdio: 'ignore',
                });
            });
        });
        describe('Android', () => {
            beforeAll(() => {
                process.env.OWL_PLATFORM = 'android';
                process.env.OWL_DEBUG = 'false';
            });
            it('should take a screenshot', async () => {
                jest
                    .spyOn(fileExistsHelpers, 'fileExists')
                    .mockResolvedValueOnce(true)
                    .mockResolvedValueOnce(true);
                await (0, screenshot_1.takeScreenshot)(SCREENSHOT_FILENAME);
                expect(commandMock).toHaveBeenCalledWith('adb exec-out screencap -p > screen.png', {
                    cwd: path_1.default.join(process.cwd(), '.owl', 'latest', 'android'),
                    shell: true,
                    stdio: 'ignore',
                });
            });
            it('should take a screenshot - baseline does not exist', async () => {
                await (0, screenshot_1.takeScreenshot)(SCREENSHOT_FILENAME);
                expect(commandMock).toHaveBeenCalledWith('adb exec-out screencap -p > screen.png', {
                    cwd: path_1.default.join(process.cwd(), '.owl', 'baseline', 'android'),
                    shell: true,
                    stdio: 'ignore',
                });
            });
        });
    });
});
