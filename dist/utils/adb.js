"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adbLaunch = exports.adbTerminate = exports.adbInstall = void 0;
const path_1 = __importDefault(require("path"));
const execa_1 = __importDefault(require("execa"));
const adbInstall = async ({ debug, binaryPath, buildType = 'Release', }) => {
    const stdio = debug ? 'inherit' : 'ignore';
    const DEFAULT_APK_DIR = `/android/app/build/outputs/apk/${buildType.toLowerCase()}/`;
    const cwd = binaryPath
        ? path_1.default.dirname(binaryPath)
        : path_1.default.join(process.cwd(), DEFAULT_APK_DIR);
    const appFilename = binaryPath
        ? path_1.default.basename(binaryPath)
        : `app-${buildType.toLowerCase()}.apk`;
    const appPath = path_1.default.join(cwd, appFilename);
    const command = `adb install -r ${appPath}`;
    await execa_1.default.command(command, { stdio });
};
exports.adbInstall = adbInstall;
const adbTerminate = async ({ debug, packageName, }) => {
    const stdio = debug ? 'inherit' : 'ignore';
    const command = `adb shell am force-stop ${packageName}`;
    await execa_1.default.command(command, { stdio });
};
exports.adbTerminate = adbTerminate;
const adbLaunch = async ({ debug, packageName, }) => {
    const stdio = debug ? 'inherit' : 'ignore';
    const command = `adb shell monkey -p "${packageName}" -c android.intent.category.LAUNCHER 1`;
    await execa_1.default.command(command, { stdio });
};
exports.adbLaunch = adbLaunch;
