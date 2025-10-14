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
const path_1 = __importDefault(require("path"));
const execa_1 = __importDefault(require("execa"));
const build_1 = require("./build");
const logger_1 = require("../logger");
const configHelpers = __importStar(require("./config"));
describe('build.ts', () => {
    const logger = new logger_1.Logger();
    const execMock = jest.spyOn(execa_1.default, 'command').mockImplementation();
    beforeEach(() => {
        execMock.mockReset();
    });
    describe('buildIOS', () => {
        it('builds an iOS project with workspace/scheme', async () => {
            const config = {
                ios: {
                    workspace: 'ios/RNDemo.xcworkspace',
                    scheme: 'RNDemo',
                    configuration: 'Debug',
                    device: 'iPhone Simulator',
                    env: { ENTRY_FILE: build_1.ENTRY_FILE },
                },
            };
            await (0, build_1.buildIOS)(config, logger);
            expect(execMock).toHaveBeenCalledTimes(1);
            expect(execMock).toHaveBeenCalledWith(`xcodebuild -workspace ios/RNDemo.xcworkspace -scheme RNDemo -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build`, { stdio: 'inherit', env: { ENTRY_FILE: build_1.ENTRY_FILE } });
        });
        it('builds an iOS project with scheme with a space in it', async () => {
            const config = {
                ios: {
                    workspace: 'ios/RNDemo.xcworkspace',
                    scheme: 'Demo With Space',
                    configuration: 'Debug',
                    device: 'iPhone Simulator',
                    env: { ENTRY_FILE: build_1.ENTRY_FILE },
                },
            };
            await (0, build_1.buildIOS)(config, logger);
            expect(execMock).toHaveBeenCalledTimes(1);
            expect(execMock).toHaveBeenCalledWith(`xcodebuild -workspace ios/RNDemo.xcworkspace -scheme Demo\\ With\\ Space -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build`, { stdio: 'inherit', env: { ENTRY_FILE: build_1.ENTRY_FILE } });
        });
        it('builds an iOS project with workspace/scheme - with the quiet arg', async () => {
            const config = {
                ios: {
                    workspace: 'ios/RNDemo.xcworkspace',
                    scheme: 'RNDemo',
                    configuration: 'Debug',
                    quiet: true,
                    device: 'iPhone Simulator',
                    env: { ENTRY_FILE: build_1.ENTRY_FILE },
                },
            };
            await (0, build_1.buildIOS)(config, logger);
            expect(execMock).toHaveBeenCalledTimes(1);
            expect(execMock).toHaveBeenCalledWith(`xcodebuild -workspace ios/RNDemo.xcworkspace -scheme RNDemo -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build -quiet`, {
                stdio: 'inherit',
                env: { ENTRY_FILE: build_1.ENTRY_FILE },
            });
        });
        it('builds an iOS project with a custom build command', async () => {
            const config = {
                ios: {
                    buildCommand: "echo 'Hello World'",
                    device: 'iPhone Simulator',
                    env: { ENTRY_FILE: build_1.ENTRY_FILE },
                },
            };
            await (0, build_1.buildIOS)(config, logger);
            expect(execMock).toHaveBeenCalledTimes(1);
            expect(execMock).toHaveBeenCalledWith(`echo 'Hello World'`, {
                stdio: 'inherit',
                env: { ENTRY_FILE: build_1.ENTRY_FILE },
            });
        });
    });
    describe('buildAndroid', () => {
        it('builds an Android project with the default build command', async () => {
            const config = {
                android: {
                    packageName: 'com.rndemo',
                    env: { ENTRY_FILE: build_1.ENTRY_FILE },
                },
            };
            await (0, build_1.buildAndroid)(config, logger);
            expect(execMock).toHaveBeenCalledTimes(1);
            expect(execMock).toHaveBeenCalledWith(`./gradlew assembleRelease --console plain -PisOwlBuild=true`, {
                stdio: 'inherit',
                cwd: path_1.default.join(process.cwd(), 'android'),
                env: { ENTRY_FILE: build_1.ENTRY_FILE },
            });
        });
        it('builds an Android project with the default build command - with the quiet arg', async () => {
            const config = {
                android: {
                    packageName: 'com.rndemo',
                    quiet: true,
                    env: { ENTRY_FILE: build_1.ENTRY_FILE },
                },
            };
            await (0, build_1.buildAndroid)(config, logger);
            expect(execMock).toHaveBeenCalledTimes(1);
            expect(execMock).toHaveBeenCalledWith(`./gradlew assembleRelease --console plain --quiet -PisOwlBuild=true`, {
                stdio: 'inherit',
                cwd: path_1.default.join(process.cwd(), 'android'),
                env: { ENTRY_FILE: build_1.ENTRY_FILE },
            });
        });
        it('builds an Android project with a custom build command', async () => {
            const config = {
                android: {
                    packageName: 'com.rndemo',
                    buildCommand: "echo 'Hello World'",
                    env: { ENTRY_FILE: build_1.ENTRY_FILE },
                },
            };
            await (0, build_1.buildAndroid)(config, logger);
            expect(execMock).toHaveBeenCalledTimes(1);
            expect(execMock).toHaveBeenCalledWith(`echo 'Hello World' -PisOwlBuild=true`, {
                stdio: 'inherit',
                env: { ENTRY_FILE: build_1.ENTRY_FILE },
            });
        });
    });
    describe('buildHandler', () => {
        const args = {
            platform: 'ios',
            config: './owl.config.json',
        };
        const config = {
            ios: {
                buildCommand: "echo 'Hello World'",
                device: 'iPhone Simulator',
                env: {
                    ENTRY_FILE: './node_modules/react-native-owl/dist/client/index.app.js',
                },
            },
            android: {
                packageName: 'com.rndemo',
                buildCommand: "echo 'Hello World'",
                env: {
                    ENTRY_FILE: './node_modules/react-native-owl/dist/client/index.app.js',
                },
            },
        };
        jest.spyOn(logger_1.Logger.prototype, 'print').mockImplementation();
        it('builds an iOS project', async () => {
            jest.spyOn(configHelpers, 'getConfig').mockResolvedValueOnce(config);
            const call = async () => (0, build_1.buildHandler)(args);
            await expect(call()).resolves.not.toThrow();
        });
        it('builds an Android project', async () => {
            jest.spyOn(configHelpers, 'getConfig').mockResolvedValueOnce(config);
            const call = async () => (0, build_1.buildHandler)({ ...args, platform: 'android' });
            await expect(call()).resolves.not.toThrow();
        });
    });
});
