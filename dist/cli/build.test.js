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
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const execa_1 = __importDefault(require("execa"));
const build_1 = require("./build");
const logger_1 = require("../logger");
const configHelpers = __importStar(require("./config"));
describe('build.ts', () => {
    const logger = new logger_1.Logger();
    const execMock = jest.spyOn(execa_1.default, 'command').mockImplementation();
    let entryFile;
    beforeEach(() => {
        execMock.mockReset();
        entryFile = (0, build_1.resolveEntryFile)();
    });
    describe('buildIOS', () => {
        it('builds an iOS project with workspace/scheme', async () => {
            const config = {
                ios: {
                    workspace: 'ios/RNDemo.xcworkspace',
                    scheme: 'RNDemo',
                    configuration: 'Debug',
                    device: 'iPhone Simulator',
                    env: { ENTRY_FILE: entryFile },
                },
            };
            await (0, build_1.buildIOS)(config, logger);
            expect(execMock).toHaveBeenCalledTimes(1);
            expect(execMock).toHaveBeenCalledWith(`xcodebuild -workspace ios/RNDemo.xcworkspace -scheme RNDemo -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build`, { stdio: 'inherit', env: { ENTRY_FILE: entryFile } });
        });
        it('builds an iOS project with scheme with a space in it', async () => {
            const config = {
                ios: {
                    workspace: 'ios/RNDemo.xcworkspace',
                    scheme: 'Demo With Space',
                    configuration: 'Debug',
                    device: 'iPhone Simulator',
                    env: { ENTRY_FILE: entryFile },
                },
            };
            await (0, build_1.buildIOS)(config, logger);
            expect(execMock).toHaveBeenCalledTimes(1);
            expect(execMock).toHaveBeenCalledWith(`xcodebuild -workspace ios/RNDemo.xcworkspace -scheme Demo\\ With\\ Space -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build`, { stdio: 'inherit', env: { ENTRY_FILE: entryFile } });
        });
        it('builds an iOS project with workspace/scheme - with the quiet arg', async () => {
            const config = {
                ios: {
                    workspace: 'ios/RNDemo.xcworkspace',
                    scheme: 'RNDemo',
                    configuration: 'Debug',
                    quiet: true,
                    device: 'iPhone Simulator',
                    env: { ENTRY_FILE: entryFile },
                },
            };
            await (0, build_1.buildIOS)(config, logger);
            expect(execMock).toHaveBeenCalledTimes(1);
            expect(execMock).toHaveBeenCalledWith(`xcodebuild -workspace ios/RNDemo.xcworkspace -scheme RNDemo -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build -quiet`, {
                stdio: 'inherit',
                env: { ENTRY_FILE: entryFile },
            });
        });
        it('builds an iOS project with a custom build command', async () => {
            const config = {
                ios: {
                    buildCommand: "echo 'Hello World'",
                    device: 'iPhone Simulator',
                    env: { ENTRY_FILE: entryFile },
                },
            };
            await (0, build_1.buildIOS)(config, logger);
            expect(execMock).toHaveBeenCalledTimes(1);
            expect(execMock).toHaveBeenCalledWith(`echo 'Hello World'`, {
                stdio: 'inherit',
                env: { ENTRY_FILE: entryFile },
            });
        });
    });
    describe('buildAndroid', () => {
        it('builds an Android project with the default build command', async () => {
            const config = {
                android: {
                    packageName: 'com.rndemo',
                    env: { ENTRY_FILE: entryFile },
                },
            };
            await (0, build_1.buildAndroid)(config, logger);
            expect(execMock).toHaveBeenCalledTimes(1);
            expect(execMock).toHaveBeenCalledWith(`./gradlew assembleRelease --console plain -PisOwlBuild=true`, {
                stdio: 'inherit',
                cwd: path_1.default.join(process.cwd(), 'android'),
                env: { ENTRY_FILE: entryFile },
            });
        });
        it('builds an Android project with the default build command - with the quiet arg', async () => {
            const config = {
                android: {
                    packageName: 'com.rndemo',
                    quiet: true,
                    env: { ENTRY_FILE: entryFile },
                },
            };
            await (0, build_1.buildAndroid)(config, logger);
            expect(execMock).toHaveBeenCalledTimes(1);
            expect(execMock).toHaveBeenCalledWith(`./gradlew assembleRelease --console plain --quiet -PisOwlBuild=true`, {
                stdio: 'inherit',
                cwd: path_1.default.join(process.cwd(), 'android'),
                env: { ENTRY_FILE: entryFile },
            });
        });
        it('builds an Android project with a custom build command', async () => {
            const config = {
                android: {
                    packageName: 'com.rndemo',
                    buildCommand: "echo 'Hello World'",
                    env: { ENTRY_FILE: entryFile },
                },
            };
            await (0, build_1.buildAndroid)(config, logger);
            expect(execMock).toHaveBeenCalledTimes(1);
            expect(execMock).toHaveBeenCalledWith(`echo 'Hello World' -PisOwlBuild=true`, {
                stdio: 'inherit',
                env: { ENTRY_FILE: entryFile },
            });
        });
    });
    describe('resolveEntryFile', () => {
        const tempDirs = [];
        afterEach(() => {
            while (tempDirs.length) {
                const dir = tempDirs.pop();
                if (dir) {
                    fs_1.default.rmSync(dir, { recursive: true, force: true });
                }
            }
        });
        it('prefers the node_modules entry file when present', () => {
            const tempDir = fs_1.default.mkdtempSync(path_1.default.join(os_1.default.tmpdir(), 'owl-entry-node-modules-'));
            tempDirs.push(tempDir);
            const entryDir = path_1.default.join(tempDir, 'node_modules', 'react-native-owl', 'dist', 'client');
            fs_1.default.mkdirSync(entryDir, { recursive: true });
            fs_1.default.writeFileSync(path_1.default.join(entryDir, 'index.app.js'), '');
            expect((0, build_1.resolveEntryFile)(tempDir)).toBe(path_1.default.join(tempDir, 'node_modules', 'react-native-owl', 'dist', 'client', 'index.app.js'));
        });
        it('falls back to the parent dist folder when using a local checkout', () => {
            const workspaceDir = fs_1.default.mkdtempSync(path_1.default.join(os_1.default.tmpdir(), 'owl-entry-workspace-'));
            tempDirs.push(workspaceDir);
            const distDir = path_1.default.join(workspaceDir, 'dist', 'client');
            fs_1.default.mkdirSync(distDir, { recursive: true });
            fs_1.default.writeFileSync(path_1.default.join(distDir, 'index.app.js'), '');
            const exampleDir = path_1.default.join(workspaceDir, 'example');
            fs_1.default.mkdirSync(exampleDir);
            expect((0, build_1.resolveEntryFile)(exampleDir)).toBe(path_1.default.join(workspaceDir, 'dist', 'client', 'index.app.js'));
        });
        it('falls back to the local dist folder when available', () => {
            const projectDir = fs_1.default.mkdtempSync(path_1.default.join(os_1.default.tmpdir(), 'owl-entry-project-'));
            tempDirs.push(projectDir);
            const distDir = path_1.default.join(projectDir, 'dist', 'client');
            fs_1.default.mkdirSync(distDir, { recursive: true });
            fs_1.default.writeFileSync(path_1.default.join(distDir, 'index.app.js'), '');
            expect((0, build_1.resolveEntryFile)(projectDir)).toBe(path_1.default.join(projectDir, 'dist', 'client', 'index.app.js'));
        });
    });
    describe('buildHandler', () => {
        const args = {
            platform: 'ios',
            config: './owl.config.json',
        };
        const createConfig = (entry) => ({
            ios: {
                buildCommand: "echo 'Hello World'",
                device: 'iPhone Simulator',
                env: { ENTRY_FILE: entry },
            },
            android: {
                packageName: 'com.rndemo',
                buildCommand: "echo 'Hello World'",
                env: { ENTRY_FILE: entry },
            },
        });
        jest.spyOn(logger_1.Logger.prototype, 'print').mockImplementation();
        it('builds an iOS project', async () => {
            const config = createConfig(entryFile);
            jest.spyOn(configHelpers, 'getConfig').mockResolvedValueOnce(config);
            const call = async () => (0, build_1.buildHandler)(args);
            await expect(call()).resolves.not.toThrow();
        });
        it('builds an Android project', async () => {
            const config = createConfig(entryFile);
            jest.spyOn(configHelpers, 'getConfig').mockResolvedValueOnce(config);
            const call = async () => (0, build_1.buildHandler)({ ...args, platform: 'android' });
            await expect(call()).resolves.not.toThrow();
        });
    });
});
