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
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const reportHelpers = __importStar(require("../report"));
const configHelpers = __importStar(require("./config"));
const run = __importStar(require("./run"));
const xcrun = __importStar(require("../utils/xcrun"));
const adb = __importStar(require("../utils/adb"));
const execa_1 = __importDefault(require("execa"));
const logger_1 = require("../logger");
jest.mock('../utils/xcrun');
jest.mock('../utils/adb');
jest
    .spyOn(process, 'cwd')
    .mockReturnValue('/Users/johndoe/Projects/my-project');
describe('run.ts', () => {
    const mkdirMock = jest.spyOn(fs_1.promises, 'mkdir');
    const execKillMock = {
        kill: jest.fn(),
    };
    const execMock = jest.spyOn(execa_1.default, 'command').mockImplementation();
    beforeEach(() => {
        mkdirMock.mockReset();
        execMock.mockReset().mockReturnValue(execKillMock);
        jest.clearAllMocks();
    });
    describe('runIOS', () => {
        it('runs an iOS project', async () => {
            const config = {
                ios: {
                    workspace: 'ios/RNDemo.xcworkspace',
                    scheme: 'RNDemo',
                    configuration: 'Debug',
                    device: 'iPhone Simulator',
                },
            };
            await run.runIOS(config);
            expect(xcrun.xcrunStatusBar).toHaveBeenCalledTimes(1);
            expect(xcrun.xcrunStatusBar).toHaveBeenCalledWith({
                debug: config.debug,
                device: config.ios?.device,
                configuration: config.ios?.configuration,
                binaryPath: config.ios?.binaryPath,
            });
            expect(xcrun.xcrunInstall).toHaveBeenCalledTimes(1);
            expect(xcrun.xcrunInstall).toHaveBeenCalledWith({
                debug: config.debug,
                device: config.ios?.device,
                configuration: config.ios?.configuration,
                binaryPath: config.ios?.binaryPath,
                scheme: config.ios?.scheme,
            });
            expect(xcrun.xcrunLaunch).toHaveBeenCalledTimes(1);
            expect(xcrun.xcrunLaunch).toHaveBeenCalledWith({
                debug: config.debug,
                device: config.ios?.device,
                configuration: config.ios?.configuration,
                binaryPath: config.ios?.binaryPath,
                scheme: config.ios?.scheme,
            });
            expect(xcrun.xcrunUi).toHaveBeenCalledTimes(1);
            expect(xcrun.xcrunUi).toHaveBeenCalledWith({
                debug: config.debug,
                device: config.ios?.device,
                configuration: config.ios?.configuration,
                binaryPath: config.ios?.binaryPath,
            });
        });
    });
    describe('restoreIOSUI', () => {
        it('cleans up an iOS project', async () => {
            const logger = new logger_1.Logger();
            const config = {
                ios: {
                    workspace: 'ios/RNDemo.xcworkspace',
                    scheme: 'RNDemo',
                    configuration: 'Debug',
                    device: 'iPhone Simulator',
                },
            };
            await run.restoreIOSUI(config, logger);
            expect(xcrun.xcrunRestore).toHaveBeenCalledTimes(1);
            expect(xcrun.xcrunRestore).toHaveBeenCalledWith({
                debug: config.debug,
                device: config.ios?.device,
                configuration: config.ios?.configuration,
                binaryPath: config.ios?.binaryPath,
            });
        });
    });
    describe('runAndroid', () => {
        it('runs an Android project', async () => {
            const config = {
                android: {
                    packageName: 'com.rndemo',
                    buildType: 'Release',
                },
            };
            await run.runAndroid(config);
            expect(adb.adbInstall).toHaveBeenCalledTimes(1);
            expect(adb.adbInstall).toHaveBeenCalledWith({
                debug: config.debug,
                buildType: config.android?.buildType,
                binaryPath: config.android?.binaryPath,
            });
            expect(adb.adbLaunch).toHaveBeenCalledTimes(1);
            expect(adb.adbLaunch).toHaveBeenCalledWith({
                debug: config.debug,
                packageName: config.android?.packageName,
            });
        });
    });
    describe('runHandler', () => {
        const args = {
            platform: 'ios',
            config: './owl.config.json',
            update: false,
        };
        const config = {
            ios: {
                workspace: 'ios/RNDemo.xcworkspace',
                scheme: 'RNDemo',
                device: 'iPhone Simulator',
            },
            android: {
                packageName: 'com.rndemo',
                buildCommand: "echo 'Hello World'",
            },
        };
        const expectedJestCommand = `jest --testMatch="**/?(*.)+(owl).[jt]s?(x)" --verbose --roots=${path_1.default.join(process.cwd())} --runInBand`;
        const commandSyncMock = jest.spyOn(execa_1.default, 'commandSync');
        const mockGenerateReport = jest.spyOn(reportHelpers, 'generateReport');
        jest.spyOn(logger_1.Logger.prototype, 'print').mockImplementation();
        beforeEach(() => {
            commandSyncMock.mockReset();
            mockGenerateReport.mockReset();
        });
        it('runs an iOS project', async () => {
            jest
                .spyOn(configHelpers, 'getConfig')
                .mockResolvedValueOnce({ ...config, report: true });
            const mockRunIOS = jest.spyOn(run, 'runIOS').mockResolvedValueOnce();
            const mockRestoreIOSUI = jest
                .spyOn(run, 'restoreIOSUI')
                .mockResolvedValueOnce();
            mkdirMock.mockResolvedValue(undefined);
            await run.runHandler(args);
            await expect(mkdirMock).toHaveBeenCalled();
            await expect(mockRunIOS).toHaveBeenCalled();
            await expect(commandSyncMock).toHaveBeenCalledTimes(1);
            await expect(commandSyncMock).toHaveBeenCalledWith(`${expectedJestCommand} --globals='{\"OWL_CLI_ARGS\":{\"platform\":\"ios\",\"config\":\"./owl.config.json\",\"update\":false}}' --json --outputFile=/Users/johndoe/Projects/my-project/.owl/report/jest-report.json`, {
                env: {
                    OWL_DEBUG: 'false',
                    OWL_IOS_SIMULATOR: 'iPhone Simulator',
                    OWL_PLATFORM: 'ios',
                    OWL_UPDATE_BASELINE: 'false',
                },
                stdio: 'inherit',
            });
            await expect(mockRestoreIOSUI).toHaveBeenCalled();
        });
        it('runs an Android project', async () => {
            jest.spyOn(configHelpers, 'getConfig').mockResolvedValueOnce(config);
            const mockRunAndroid = jest
                .spyOn(run, 'runAndroid')
                .mockResolvedValueOnce();
            await run.runHandler({ ...args, platform: 'android' });
            await expect(mockRunAndroid).toHaveBeenCalled();
            await expect(commandSyncMock).toHaveBeenCalledTimes(1);
            await expect(commandSyncMock).toHaveBeenCalledWith(`${expectedJestCommand} --globals='{\"OWL_CLI_ARGS\":{\"platform\":\"android\",\"config\":\"./owl.config.json\",\"update\":false}}'`, {
                env: {
                    OWL_DEBUG: 'false',
                    OWL_IOS_SIMULATOR: 'iPhone Simulator',
                    OWL_PLATFORM: 'android',
                    OWL_UPDATE_BASELINE: 'false',
                },
                stdio: 'inherit',
            });
        });
        it('runs with the update baseline flag on', async () => {
            jest.spyOn(configHelpers, 'getConfig').mockResolvedValueOnce(config);
            const mockRunIOS = jest.spyOn(run, 'runIOS').mockResolvedValueOnce();
            await run.runHandler({ ...args, update: true });
            await expect(mockRunIOS).toHaveBeenCalled();
            await expect(commandSyncMock).toHaveBeenCalledTimes(1);
            await expect(commandSyncMock).toHaveBeenCalledWith(`${expectedJestCommand} --globals='{\"OWL_CLI_ARGS\":{\"platform\":\"ios\",\"config\":\"./owl.config.json\",\"update\":true}}'`, {
                env: {
                    OWL_DEBUG: 'false',
                    OWL_IOS_SIMULATOR: 'iPhone Simulator',
                    OWL_PLATFORM: 'ios',
                    OWL_UPDATE_BASELINE: 'true',
                },
                stdio: 'inherit',
            });
        });
        it('runs the scripts/websocket-server.js script', async () => {
            jest.spyOn(configHelpers, 'getConfig').mockResolvedValueOnce(config);
            await run.runHandler({ ...args });
            await expect(execMock.mock.calls[0][0]).toEqual('node scripts/websocket-server.js');
        });
        it('runs generates the report if the config is set to on', async () => {
            const caseConfig = {
                ...config,
                report: true,
            };
            jest.spyOn(configHelpers, 'getConfig').mockResolvedValueOnce(caseConfig);
            const mockRunIOS = jest.spyOn(run, 'runIOS').mockResolvedValueOnce();
            commandSyncMock.mockRejectedValueOnce(undefined);
            try {
                await run.runHandler({ ...args, update: true });
            }
            catch {
                await expect(mockRunIOS).toHaveBeenCalled();
                await expect(commandSyncMock).toHaveBeenCalledTimes(1);
                await expect(mockGenerateReport).toHaveBeenCalledTimes(1);
            }
        });
        it('does not generate the report if the config is set to off', async () => {
            const caseConfig = {
                ...config,
                report: false,
            };
            jest.spyOn(configHelpers, 'getConfig').mockResolvedValueOnce(caseConfig);
            const mockRunIOS = jest.spyOn(run, 'runIOS').mockResolvedValueOnce();
            commandSyncMock.mockRejectedValueOnce(undefined);
            try {
                await run.runHandler({ ...args });
            }
            catch {
                await expect(commandSyncMock).toHaveBeenCalledWith(`${expectedJestCommand} --globals='{\"OWL_CLI_ARGS\":{\"platform\":\"ios\",\"config\":\"./owl.config.json\",\"update\":false}}'`, {
                    env: {
                        OWL_DEBUG: 'false',
                        OWL_IOS_SIMULATOR: 'iPhone Simulator',
                        OWL_PLATFORM: 'ios',
                        OWL_UPDATE_BASELINE: 'false',
                    },
                    stdio: 'inherit',
                });
                await expect(mockRunIOS).toHaveBeenCalled();
                await expect(commandSyncMock).toHaveBeenCalledTimes(1);
                await expect(mkdirMock).not.toHaveBeenCalled();
                await expect(mockGenerateReport).not.toHaveBeenCalled();
            }
        });
        it('runs with a specific testPathPattern', async () => {
            jest.spyOn(configHelpers, 'getConfig').mockResolvedValueOnce(config);
            const mockRunIOS = jest.spyOn(run, 'runIOS').mockResolvedValueOnce();
            const testPathPattern = '*';
            await run.runHandler({ ...args, testPathPattern });
            await expect(mockRunIOS).toHaveBeenCalled();
            await expect(commandSyncMock).toHaveBeenCalledTimes(1);
            await expect(commandSyncMock).toHaveBeenCalledWith(`${expectedJestCommand} --globals='{\"OWL_CLI_ARGS\":{\"platform\":\"ios\",\"config\":\"./owl.config.json\",\"update\":false,\"testPathPattern\":\"${testPathPattern}\"}}' --testPathPattern="${testPathPattern}"`, expect.anything());
        });
        it('runs without a testPathPattern', async () => {
            jest.spyOn(configHelpers, 'getConfig').mockResolvedValueOnce(config);
            const mockRunIOS = jest.spyOn(run, 'runIOS').mockResolvedValueOnce();
            await run.runHandler(args);
            await expect(mockRunIOS).toHaveBeenCalled();
            await expect(commandSyncMock).toHaveBeenCalledTimes(1);
            await expect(commandSyncMock).toHaveBeenCalledWith(`${expectedJestCommand} --globals='{\"OWL_CLI_ARGS\":{\"platform\":\"ios\",\"config\":\"./owl.config.json\",\"update\":false}}'`, expect.anything());
        });
    });
});
