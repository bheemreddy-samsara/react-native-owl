"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildHandler = exports.buildAndroid = exports.buildIOS = exports.ENTRY_FILE = void 0;
const path_1 = __importDefault(require("path"));
const execa_1 = __importDefault(require("execa"));
const logger_1 = require("../logger");
const config_1 = require("./config");
exports.ENTRY_FILE = './node_modules/react-native-owl/dist/client/index.app.js';
const buildIOS = async (config, logger) => {
    const buildCommand = config.ios?.buildCommand
        ? [config.ios?.buildCommand]
        : [
            `xcodebuild`,
            `-workspace ${config.ios?.workspace}`,
            `-scheme ${config.ios?.scheme?.split(' ').join('\\ ')}`,
            `-configuration ${config.ios?.configuration}`,
            `-sdk iphonesimulator`,
            `-derivedDataPath ios/build`,
        ];
    if (!config.ios?.buildCommand && config.ios?.quiet) {
        buildCommand.push('-quiet');
    }
    logger.info(`[OWL - CLI] Building the app with: ${buildCommand.join(' ')}.`);
    await execa_1.default.command(buildCommand.join(' '), {
        stdio: 'inherit',
        env: {
            ENTRY_FILE: exports.ENTRY_FILE,
        },
    });
};
exports.buildIOS = buildIOS;
const buildAndroid = async (config, logger) => {
    const buildCommand = config.android?.buildCommand
        ? [config.android?.buildCommand]
        : [
            `./gradlew`,
            config.android?.buildType === 'Debug'
                ? `assembleDebug`
                : 'assembleRelease',
            '--console plain',
        ];
    if (!config.android?.buildCommand && config.android?.quiet) {
        buildCommand.push('--quiet');
    }
    // Add a project environmental to tell build.gradle to use a specific Android Manifest that allows WebSocket usage.
    // (https://docs.gradle.org/current/userguide/command_line_interface.html#sec:environment_options)
    buildCommand.push('-PisOwlBuild=true');
    const cwd = config.android?.buildCommand
        ? undefined
        : path_1.default.join(process.cwd(), 'android');
    logger.info(`[OWL - CLI] Building the app with: ${buildCommand.join(' ')}.`);
    await execa_1.default.command(buildCommand.join(' '), {
        stdio: 'inherit',
        cwd,
        env: {
            ENTRY_FILE: exports.ENTRY_FILE,
        },
    });
};
exports.buildAndroid = buildAndroid;
const buildHandler = async (args) => {
    const config = await (0, config_1.getConfig)(args.config);
    const logger = new logger_1.Logger(config.debug);
    const buildProject = args.platform === 'ios' ? exports.buildIOS : exports.buildAndroid;
    logger.print(`[OWL - CLI] Building the app on ${args.platform} platform.`);
    logger.info(`[OWL - CLI] Using the config file ${args.config}.`);
    await buildProject(config, logger);
    logger.info(`[OWL - CLI] Successfully built for the ${args.platform} platform.`);
};
exports.buildHandler = buildHandler;
