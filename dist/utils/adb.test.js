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
const adb = __importStar(require("./adb"));
describe('adb.ts', () => {
    jest
        .spyOn(process, 'cwd')
        .mockReturnValue('/Users/johndoe/Projects/my-project');
    const execKillMock = {
        kill: jest.fn(),
    };
    const execMock = jest.spyOn(execa_1.default, 'command').mockReturnValue(execKillMock);
    beforeEach(() => {
        execMock.mockReset();
    });
    describe('adbInstall', () => {
        it('installs an app with default config', async () => {
            await adb.adbInstall({});
            expect(execMock).toHaveBeenCalledTimes(1);
            expect(execMock).toHaveBeenCalledWith('adb install -r /Users/johndoe/Projects/my-project/android/app/build/outputs/apk/release/app-release.apk', { stdio: 'ignore' });
        });
        it('installs an app with debugging', async () => {
            await adb.adbInstall({ debug: true });
            expect(execMock).toHaveBeenCalledTimes(1);
            expect(execMock).toHaveBeenCalledWith('adb install -r /Users/johndoe/Projects/my-project/android/app/build/outputs/apk/release/app-release.apk', { stdio: 'inherit' });
        });
        it('installs an app with custom buildType', async () => {
            await adb.adbInstall({
                buildType: 'Debug',
            });
            expect(execMock).toHaveBeenCalledTimes(1);
            expect(execMock).toHaveBeenCalledWith('adb install -r /Users/johndoe/Projects/my-project/android/app/build/outputs/apk/debug/app-debug.apk', { stdio: 'ignore' });
        });
        it('installs an app with custom binaryPath', async () => {
            await adb.adbInstall({
                binaryPath: '/custom/path/app.apk',
            });
            expect(execMock).toHaveBeenCalledTimes(1);
            expect(execMock).toHaveBeenCalledWith('adb install -r /custom/path/app.apk', { stdio: 'ignore' });
        });
    });
    describe('adbTerminate', () => {
        it('terminates an app', async () => {
            await adb.adbTerminate({ packageName: 'com.name.app' });
            expect(execMock).toHaveBeenCalledTimes(1);
            expect(execMock).toHaveBeenCalledWith('adb shell am force-stop com.name.app', { stdio: 'ignore' });
        });
        it('terminates an app with debugging', async () => {
            await adb.adbTerminate({ debug: true, packageName: 'com.name.app' });
            expect(execMock).toHaveBeenCalledTimes(1);
            expect(execMock).toHaveBeenCalledWith('adb shell am force-stop com.name.app', { stdio: 'inherit' });
        });
    });
    describe('adbLaunch', () => {
        it('launches an app', async () => {
            await adb.adbLaunch({ packageName: 'com.name.app' });
            expect(execMock).toHaveBeenCalledTimes(1);
            expect(execMock).toHaveBeenCalledWith('adb shell monkey -p "com.name.app" -c android.intent.category.LAUNCHER 1', { stdio: 'ignore' });
        });
        it('launches an app with debugging', async () => {
            await adb.adbLaunch({ debug: true, packageName: 'com.name.app' });
            expect(execMock).toHaveBeenCalledTimes(1);
            expect(execMock).toHaveBeenCalledWith('adb shell monkey -p "com.name.app" -c android.intent.category.LAUNCHER 1', { stdio: 'inherit' });
        });
    });
});
