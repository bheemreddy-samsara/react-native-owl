"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.xcrunRestore = exports.xcrunUi = exports.xcrunLaunch = exports.xcrunTerminate = exports.xcrunInstall = exports.xcrunStatusBar = void 0;
const path_1 = __importDefault(require("path"));
const execa_1 = __importDefault(require("execa"));
const wait_for_1 = require("./wait-for");
const xcrunStatusBar = async ({ debug, binaryPath, device, configuration = 'Debug', }) => {
    const stdio = debug ? 'inherit' : 'ignore';
    const DEFAULT_BINARY_DIR = `/ios/build/Build/Products/${configuration}-iphonesimulator`;
    const cwd = binaryPath
        ? path_1.default.dirname(binaryPath)
        : path_1.default.join(process.cwd(), DEFAULT_BINARY_DIR);
    const simulator = device.replace(/([ /])/g, '\\$1');
    const SIMULATOR_TIME = '9:41';
    const command = `xcrun simctl status_bar ${simulator} override --time ${SIMULATOR_TIME}`;
    await execa_1.default.command(command, { stdio, cwd });
};
exports.xcrunStatusBar = xcrunStatusBar;
const xcrunInstall = async ({ debug, binaryPath, device, scheme, configuration = 'Debug', }) => {
    const stdio = debug ? 'inherit' : 'ignore';
    const DEFAULT_BINARY_DIR = `/ios/build/Build/Products/${configuration}-iphonesimulator`;
    const cwd = binaryPath
        ? path_1.default.dirname(binaryPath)
        : path_1.default.join(process.cwd(), DEFAULT_BINARY_DIR);
    const appFilename = binaryPath ? path_1.default.basename(binaryPath) : `${scheme}.app`;
    const simulator = device.replace(/([ /])/g, '\\$1');
    const command = `xcrun simctl install ${simulator} ${appFilename}`;
    await execa_1.default.command(command, { stdio, cwd });
};
exports.xcrunInstall = xcrunInstall;
const xcrunTerminate = async ({ debug, binaryPath, device, scheme, configuration = 'Debug', }) => {
    const stdio = debug ? 'inherit' : 'ignore';
    const DEFAULT_BINARY_DIR = `/ios/build/Build/Products/${configuration}-iphonesimulator`;
    const cwd = binaryPath
        ? path_1.default.dirname(binaryPath)
        : path_1.default.join(process.cwd(), DEFAULT_BINARY_DIR);
    const appFilename = binaryPath ? path_1.default.basename(binaryPath) : `${scheme}.app`;
    const plistPath = path_1.default.join(cwd, appFilename, 'Info.plist');
    const { stdout: bundleId } = await execa_1.default.command(`./PlistBuddy -c 'Print CFBundleIdentifier' ${plistPath}`, { shell: true, cwd: '/usr/libexec' });
    const simulator = device.replace(/([ /])/g, '\\$1');
    const command = `xcrun simctl terminate ${simulator} ${bundleId}`;
    await execa_1.default.command(command, { stdio, cwd });
};
exports.xcrunTerminate = xcrunTerminate;
const xcrunLaunch = async ({ debug, binaryPath, device, scheme, configuration = 'Debug', }) => {
    const stdio = debug ? 'inherit' : 'ignore';
    const DEFAULT_BINARY_DIR = `/ios/build/Build/Products/${configuration}-iphonesimulator`;
    const cwd = binaryPath
        ? path_1.default.dirname(binaryPath)
        : path_1.default.join(process.cwd(), DEFAULT_BINARY_DIR);
    const appFilename = binaryPath ? path_1.default.basename(binaryPath) : `${scheme}.app`;
    const plistPath = path_1.default.join(cwd, appFilename, 'Info.plist');
    const { stdout: bundleId } = await execa_1.default.command(`./PlistBuddy -c 'Print CFBundleIdentifier' ${plistPath}`, { shell: true, cwd: '/usr/libexec' });
    const simulator = device.replace(/([ /])/g, '\\$1');
    const command = `xcrun simctl launch ${simulator} ${bundleId}`;
    await execa_1.default.command(command, { stdio, cwd });
};
exports.xcrunLaunch = xcrunLaunch;
const xcrunUi = async ({ debug, binaryPath, device, configuration = 'Debug', }) => {
    const stdio = debug ? 'inherit' : 'ignore';
    const DEFAULT_BINARY_DIR = `/ios/build/Build/Products/${configuration}-iphonesimulator`;
    const cwd = binaryPath
        ? path_1.default.dirname(binaryPath)
        : path_1.default.join(process.cwd(), DEFAULT_BINARY_DIR);
    const simulator = device.replace(/([ /])/g, '\\$1');
    const command = `xcrun simctl ui ${simulator} appearance`;
    await execa_1.default.command(`${command} dark`, { stdio, cwd });
    await (0, wait_for_1.waitFor)(500);
    await execa_1.default.command(`${command} light`, { stdio, cwd });
    await (0, wait_for_1.waitFor)(500);
};
exports.xcrunUi = xcrunUi;
const xcrunRestore = async ({ debug, binaryPath, device, configuration = 'Debug', }) => {
    const stdio = debug ? 'inherit' : 'ignore';
    const DEFAULT_BINARY_DIR = `/ios/build/Build/Products/${configuration}-iphonesimulator`;
    const cwd = binaryPath
        ? path_1.default.dirname(binaryPath)
        : path_1.default.join(process.cwd(), DEFAULT_BINARY_DIR);
    const simulator = device.replace(/([ /])/g, '\\$1');
    const command = `xcrun simctl status_bar ${simulator} clear`;
    await execa_1.default.command(command, { stdio, cwd });
};
exports.xcrunRestore = xcrunRestore;
