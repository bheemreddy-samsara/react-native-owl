"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runHandler = exports.runAndroid = exports.restoreIOSUI = exports.runIOS = void 0;
const path_1 = __importDefault(require("path"));
const execa_1 = __importDefault(require("execa"));
const fs_1 = require("fs");
const screenshot_1 = require("../screenshot");
const report_1 = require("../report");
const config_1 = require("./config");
const logger_1 = require("../logger");
const wait_for_1 = require("../utils/wait-for");
const adb_1 = require("../utils/adb");
const xcrun_1 = require("../utils/xcrun");
const runIOS = async (config) => {
    if (!config.ios) {
        return;
    }
    await (0, xcrun_1.xcrunStatusBar)({
        debug: config.debug,
        device: config.ios.device,
        configuration: config.ios.configuration,
        binaryPath: config.ios.binaryPath,
    });
    await (0, xcrun_1.xcrunInstall)({
        debug: config.debug,
        device: config.ios.device,
        configuration: config.ios.configuration,
        binaryPath: config.ios.binaryPath,
        scheme: config.ios.scheme,
    });
    await (0, xcrun_1.xcrunLaunch)({
        debug: config.debug,
        device: config.ios.device,
        configuration: config.ios.configuration,
        binaryPath: config.ios.binaryPath,
        scheme: config.ios.scheme,
    });
    await (0, wait_for_1.waitFor)(1000);
    // Workaround to force the virtual home button's color to become consistent
    await (0, xcrun_1.xcrunUi)({
        debug: config.debug,
        device: config.ios.device,
        configuration: config.ios.configuration,
        binaryPath: config.ios.binaryPath,
    });
};
exports.runIOS = runIOS;
const restoreIOSUI = async (config, logger) => {
    if (!config.ios) {
        return;
    }
    await (0, xcrun_1.xcrunRestore)({
        debug: config.debug,
        device: config.ios.device,
        configuration: config.ios.configuration,
        binaryPath: config.ios.binaryPath,
    });
    logger.print(`[OWL - CLI] Restored status bar time`);
};
exports.restoreIOSUI = restoreIOSUI;
const runAndroid = async (config) => {
    if (!config.android) {
        return;
    }
    await (0, adb_1.adbInstall)({
        debug: config.debug,
        buildType: config.android.buildType,
        binaryPath: config.android.binaryPath,
    });
    await (0, adb_1.adbLaunch)({
        debug: config.debug,
        packageName: config.android.packageName,
    });
    await (0, wait_for_1.waitFor)(500);
};
exports.runAndroid = runAndroid;
const runHandler = async (args) => {
    const cwd = process.cwd();
    const config = await (0, config_1.getConfig)(args.config);
    const logger = new logger_1.Logger(config.debug);
    const runProject = args.platform === 'ios' ? exports.runIOS : exports.runAndroid;
    const restoreSimulatorUI = args.platform === 'ios' && exports.restoreIOSUI;
    // Remove old report and screenshots
    await (0, report_1.cleanupReport)();
    await (0, screenshot_1.cleanupScreenshots)();
    logger.print(`[OWL - CLI] Starting websocket server.`);
    const webSocketProcess = execa_1.default.command('node scripts/websocket-server.js', {
        stdio: 'inherit',
        cwd: path_1.default.join(__dirname, '..', '..'),
        env: {
            OWL_DEBUG: String(!!config.debug),
        },
    });
    logger.print(`[OWL - CLI] Running tests on ${args.platform}.`);
    await runProject(config);
    const jestCommandArgs = [
        'jest',
        `--testMatch="**/?(*.)+(owl).[jt]s?(x)"`,
        '--verbose',
        `--roots=${cwd}`,
        '--runInBand',
        `--globals='${JSON.stringify({ OWL_CLI_ARGS: args })}'`,
    ];
    if (args.testPathPattern) {
        jestCommandArgs.push('--testPathPattern="' + args.testPathPattern + '"');
    }
    if (config.report) {
        const reportDirPath = path_1.default.join(cwd, '.owl', 'report');
        const outputFile = path_1.default.join(reportDirPath, 'jest-report.json');
        await fs_1.promises.mkdir(reportDirPath, { recursive: true });
        jestCommandArgs.push(`--json --outputFile=${outputFile}`);
    }
    if (args.testNamePattern) {
        jestCommandArgs.push(`-t`, `${args.testNamePattern}`);
    }
    const jestCommand = jestCommandArgs.join(' ');
    logger.print(`[OWL - CLI] ${args.update
        ? '(Update mode) Updating baseline images'
        : '(Tests mode) Will compare latest images with the baseline'}.`);
    logger.info(`[OWL - CLI] Will set the jest root to ${process.cwd()}.`);
    try {
        await execa_1.default.commandSync(jestCommand, {
            stdio: 'inherit',
            env: {
                OWL_PLATFORM: args.platform,
                OWL_DEBUG: String(!!config.debug),
                OWL_UPDATE_BASELINE: String(!!args.update),
                OWL_IOS_SIMULATOR: config.ios?.device,
            },
        });
    }
    catch (error) {
        // Throw the error again, so that ci will fail when the jest tests fail
        throw error;
    }
    finally {
        if (config.report) {
            await (0, report_1.generateReport)(logger, args.platform);
        }
        webSocketProcess.kill();
        if (restoreSimulatorUI) {
            await restoreSimulatorUI(config, logger);
        }
        logger.print(`[OWL - CLI] Tests completed on ${args.platform}.`);
        if (args.update) {
            logger.print(`[OWL - CLI] All baseline images for ${args.platform} have been updated successfully.`);
        }
    }
};
exports.runHandler = runHandler;
