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
const xcrun = __importStar(require("./xcrun"));
describe('xcrun.ts', () => {
    jest
        .spyOn(process, 'cwd')
        .mockReturnValue('/Users/johndoe/Projects/my-project');
    const execKillMock = {
        kill: jest.fn(),
        stdout: 'bundleId',
    };
    const execMock = jest.spyOn(execa_1.default, 'command').mockReturnValue(execKillMock);
    beforeEach(() => {
        execMock.mockClear();
    });
    describe('xcrunStatusBar', () => {
        it('updates the status bar with default config', async () => {
            await xcrun.xcrunStatusBar({ device: 'iPhone 13 Pro' });
            expect(execMock).toHaveBeenCalledTimes(1);
            expect(execMock).toHaveBeenCalledWith('xcrun simctl status_bar iPhone\\ 13\\ Pro override --time 9:41', {
                cwd: '/Users/johndoe/Projects/my-project/ios/build/Build/Products/Debug-iphonesimulator',
                stdio: 'ignore',
            });
        });
        it('updates the status bar with debug', async () => {
            await xcrun.xcrunStatusBar({ device: 'iPhone 13 Pro', debug: true });
            expect(execMock).toHaveBeenCalledTimes(1);
            expect(execMock).toHaveBeenCalledWith('xcrun simctl status_bar iPhone\\ 13\\ Pro override --time 9:41', {
                cwd: '/Users/johndoe/Projects/my-project/ios/build/Build/Products/Debug-iphonesimulator',
                stdio: 'inherit',
            });
        });
        it('updates the status bar with custom configuration', async () => {
            await xcrun.xcrunStatusBar({
                device: 'iPhone 13 Pro',
                configuration: 'Release',
            });
            expect(execMock).toHaveBeenCalledTimes(1);
            expect(execMock).toHaveBeenCalledWith('xcrun simctl status_bar iPhone\\ 13\\ Pro override --time 9:41', {
                cwd: '/Users/johndoe/Projects/my-project/ios/build/Build/Products/Release-iphonesimulator',
                stdio: 'ignore',
            });
        });
        it('updates the status bar with custom binaryPath', async () => {
            await xcrun.xcrunStatusBar({
                device: 'iPhone 13 Pro',
                binaryPath: '/some/path/to/my/app.app',
            });
            expect(execMock).toHaveBeenCalledTimes(1);
            expect(execMock).toHaveBeenCalledWith('xcrun simctl status_bar iPhone\\ 13\\ Pro override --time 9:41', {
                cwd: '/some/path/to/my',
                stdio: 'ignore',
            });
        });
    });
    describe('xcrunInstall', () => {
        it('installs the app with default config', async () => {
            await xcrun.xcrunInstall({ device: 'iPhone 13 Pro', scheme: 'MyApp' });
            expect(execMock).toHaveBeenCalledTimes(1);
            expect(execMock).toHaveBeenCalledWith('xcrun simctl install iPhone\\ 13\\ Pro MyApp.app', {
                cwd: '/Users/johndoe/Projects/my-project/ios/build/Build/Products/Debug-iphonesimulator',
                stdio: 'ignore',
            });
        });
        it('installs the app with debug', async () => {
            await xcrun.xcrunInstall({
                device: 'iPhone 13 Pro',
                scheme: 'MyApp',
                debug: true,
            });
            expect(execMock).toHaveBeenCalledTimes(1);
            expect(execMock).toHaveBeenCalledWith('xcrun simctl install iPhone\\ 13\\ Pro MyApp.app', {
                cwd: '/Users/johndoe/Projects/my-project/ios/build/Build/Products/Debug-iphonesimulator',
                stdio: 'inherit',
            });
        });
        it('installs the app with custom configuration', async () => {
            await xcrun.xcrunInstall({
                device: 'iPhone 13 Pro',
                scheme: 'MyApp',
                configuration: 'Release',
            });
            expect(execMock).toHaveBeenCalledTimes(1);
            expect(execMock).toHaveBeenCalledWith('xcrun simctl install iPhone\\ 13\\ Pro MyApp.app', {
                cwd: '/Users/johndoe/Projects/my-project/ios/build/Build/Products/Release-iphonesimulator',
                stdio: 'ignore',
            });
        });
        it('installs the app with custom binaryPath', async () => {
            await xcrun.xcrunInstall({
                device: 'iPhone 13 Pro',
                configuration: 'Release',
                binaryPath: '/some/path/to/my/app.app',
            });
            expect(execMock).toHaveBeenCalledTimes(1);
            expect(execMock).toHaveBeenCalledWith('xcrun simctl install iPhone\\ 13\\ Pro app.app', {
                cwd: '/some/path/to/my',
                stdio: 'ignore',
            });
        });
    });
    describe('xcrunTerminate', () => {
        it('terminates the app with default config', async () => {
            await xcrun.xcrunTerminate({ device: 'iPhone 13 Pro', scheme: 'MyApp' });
            expect(execMock).toHaveBeenCalledTimes(2);
            expect(execMock).toHaveBeenNthCalledWith(1, "./PlistBuddy -c 'Print CFBundleIdentifier' /Users/johndoe/Projects/my-project/ios/build/Build/Products/Debug-iphonesimulator/MyApp.app/Info.plist", {
                cwd: '/usr/libexec',
                shell: true,
            });
            expect(execMock).toHaveBeenNthCalledWith(2, 'xcrun simctl terminate iPhone\\ 13\\ Pro bundleId', {
                cwd: '/Users/johndoe/Projects/my-project/ios/build/Build/Products/Debug-iphonesimulator',
                stdio: 'ignore',
            });
        });
        it('terminates the app with debug', async () => {
            await xcrun.xcrunTerminate({
                device: 'iPhone 13 Pro',
                scheme: 'MyApp',
                debug: true,
            });
            expect(execMock).toHaveBeenCalledTimes(2);
            expect(execMock).toHaveBeenNthCalledWith(2, 'xcrun simctl terminate iPhone\\ 13\\ Pro bundleId', {
                cwd: '/Users/johndoe/Projects/my-project/ios/build/Build/Products/Debug-iphonesimulator',
                stdio: 'inherit',
            });
        });
        it('terminates the app with custom configuration', async () => {
            await xcrun.xcrunTerminate({
                device: 'iPhone 13 Pro',
                scheme: 'MyApp',
                configuration: 'Release',
            });
            expect(execMock).toHaveBeenCalledTimes(2);
            expect(execMock).toHaveBeenNthCalledWith(1, "./PlistBuddy -c 'Print CFBundleIdentifier' /Users/johndoe/Projects/my-project/ios/build/Build/Products/Release-iphonesimulator/MyApp.app/Info.plist", {
                cwd: '/usr/libexec',
                shell: true,
            });
            expect(execMock).toHaveBeenNthCalledWith(2, 'xcrun simctl terminate iPhone\\ 13\\ Pro bundleId', {
                cwd: '/Users/johndoe/Projects/my-project/ios/build/Build/Products/Release-iphonesimulator',
                stdio: 'ignore',
            });
        });
        it('terminates the app with custom binaryPath', async () => {
            await xcrun.xcrunTerminate({
                device: 'iPhone 13 Pro',
                configuration: 'Release',
                binaryPath: '/some/path/to/my/app.app',
            });
            expect(execMock).toHaveBeenCalledTimes(2);
            expect(execMock).toHaveBeenNthCalledWith(1, "./PlistBuddy -c 'Print CFBundleIdentifier' /some/path/to/my/app.app/Info.plist", {
                cwd: '/usr/libexec',
                shell: true,
            });
            expect(execMock).toHaveBeenNthCalledWith(2, 'xcrun simctl terminate iPhone\\ 13\\ Pro bundleId', {
                cwd: '/some/path/to/my',
                stdio: 'ignore',
            });
        });
    });
    describe('xcrunLaunch', () => {
        it('launches the app with default config', async () => {
            await xcrun.xcrunLaunch({ device: 'iPhone 13 Pro', scheme: 'MyApp' });
            expect(execMock).toHaveBeenCalledTimes(2);
            expect(execMock).toHaveBeenNthCalledWith(1, "./PlistBuddy -c 'Print CFBundleIdentifier' /Users/johndoe/Projects/my-project/ios/build/Build/Products/Debug-iphonesimulator/MyApp.app/Info.plist", {
                cwd: '/usr/libexec',
                shell: true,
            });
            expect(execMock).toHaveBeenNthCalledWith(2, 'xcrun simctl launch iPhone\\ 13\\ Pro bundleId', {
                cwd: '/Users/johndoe/Projects/my-project/ios/build/Build/Products/Debug-iphonesimulator',
                stdio: 'ignore',
            });
        });
        it('launches the app with debug', async () => {
            await xcrun.xcrunLaunch({
                device: 'iPhone 13 Pro',
                scheme: 'MyApp',
                debug: true,
            });
            expect(execMock).toHaveBeenCalledTimes(2);
            expect(execMock).toHaveBeenNthCalledWith(2, 'xcrun simctl launch iPhone\\ 13\\ Pro bundleId', {
                cwd: '/Users/johndoe/Projects/my-project/ios/build/Build/Products/Debug-iphonesimulator',
                stdio: 'inherit',
            });
        });
        it('launches the app with custom configuration', async () => {
            await xcrun.xcrunLaunch({
                device: 'iPhone 13 Pro',
                scheme: 'MyApp',
                configuration: 'Release',
            });
            expect(execMock).toHaveBeenCalledTimes(2);
            expect(execMock).toHaveBeenNthCalledWith(1, "./PlistBuddy -c 'Print CFBundleIdentifier' /Users/johndoe/Projects/my-project/ios/build/Build/Products/Release-iphonesimulator/MyApp.app/Info.plist", {
                cwd: '/usr/libexec',
                shell: true,
            });
            expect(execMock).toHaveBeenNthCalledWith(2, 'xcrun simctl launch iPhone\\ 13\\ Pro bundleId', {
                cwd: '/Users/johndoe/Projects/my-project/ios/build/Build/Products/Release-iphonesimulator',
                stdio: 'ignore',
            });
        });
        it('launches the app with custom binaryPath', async () => {
            await xcrun.xcrunLaunch({
                device: 'iPhone 13 Pro',
                configuration: 'Release',
                binaryPath: '/some/path/to/my/app.app',
            });
            expect(execMock).toHaveBeenCalledTimes(2);
            expect(execMock).toHaveBeenNthCalledWith(1, "./PlistBuddy -c 'Print CFBundleIdentifier' /some/path/to/my/app.app/Info.plist", {
                cwd: '/usr/libexec',
                shell: true,
            });
            expect(execMock).toHaveBeenNthCalledWith(2, 'xcrun simctl launch iPhone\\ 13\\ Pro bundleId', {
                cwd: '/some/path/to/my',
                stdio: 'ignore',
            });
        });
    });
    describe('xcrunUi', () => {
        it('sets the simulator UI with default config', async () => {
            await xcrun.xcrunUi({ device: 'iPhone 13 Pro' });
            expect(execMock).toHaveBeenCalledTimes(2);
            expect(execMock).toHaveBeenNthCalledWith(1, 'xcrun simctl ui iPhone\\ 13\\ Pro appearance dark', {
                cwd: '/Users/johndoe/Projects/my-project/ios/build/Build/Products/Debug-iphonesimulator',
                stdio: 'ignore',
            });
            expect(execMock).toHaveBeenNthCalledWith(2, 'xcrun simctl ui iPhone\\ 13\\ Pro appearance light', {
                cwd: '/Users/johndoe/Projects/my-project/ios/build/Build/Products/Debug-iphonesimulator',
                stdio: 'ignore',
            });
        });
        it('sets the simulator UI with debug', async () => {
            await xcrun.xcrunUi({
                device: 'iPhone 13 Pro',
                debug: true,
            });
            expect(execMock).toHaveBeenCalledTimes(2);
            expect(execMock).toHaveBeenNthCalledWith(1, 'xcrun simctl ui iPhone\\ 13\\ Pro appearance dark', {
                cwd: '/Users/johndoe/Projects/my-project/ios/build/Build/Products/Debug-iphonesimulator',
                stdio: 'inherit',
            });
            expect(execMock).toHaveBeenNthCalledWith(2, 'xcrun simctl ui iPhone\\ 13\\ Pro appearance light', {
                cwd: '/Users/johndoe/Projects/my-project/ios/build/Build/Products/Debug-iphonesimulator',
                stdio: 'inherit',
            });
        });
        it('sets the simulator UI with custom configuration', async () => {
            await xcrun.xcrunUi({
                device: 'iPhone 13 Pro',
                configuration: 'Release',
            });
            expect(execMock).toHaveBeenCalledTimes(2);
            expect(execMock).toHaveBeenNthCalledWith(1, 'xcrun simctl ui iPhone\\ 13\\ Pro appearance dark', {
                cwd: '/Users/johndoe/Projects/my-project/ios/build/Build/Products/Release-iphonesimulator',
                stdio: 'ignore',
            });
            expect(execMock).toHaveBeenNthCalledWith(2, 'xcrun simctl ui iPhone\\ 13\\ Pro appearance light', {
                cwd: '/Users/johndoe/Projects/my-project/ios/build/Build/Products/Release-iphonesimulator',
                stdio: 'ignore',
            });
        });
        it('sets the simulator UI with custom binaryPath', async () => {
            await xcrun.xcrunUi({
                device: 'iPhone 13 Pro',
                configuration: 'Release',
                binaryPath: '/some/path/to/my/app.app',
            });
            expect(execMock).toHaveBeenCalledTimes(2);
            expect(execMock).toHaveBeenNthCalledWith(1, 'xcrun simctl ui iPhone\\ 13\\ Pro appearance dark', {
                cwd: '/some/path/to/my',
                stdio: 'ignore',
            });
            expect(execMock).toHaveBeenNthCalledWith(2, 'xcrun simctl ui iPhone\\ 13\\ Pro appearance light', {
                cwd: '/some/path/to/my',
                stdio: 'ignore',
            });
        });
    });
});
