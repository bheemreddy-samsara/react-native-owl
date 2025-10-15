"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const config_1 = require("./config");
describe('config.ts', () => {
    describe('validateSchema', () => {
        it('validates a config', async () => {
            const config = {
                ios: {
                    buildCommand: 'echo "Hello iOS"',
                    binaryPath: '',
                    device: 'iPhone Simulator',
                },
                android: {
                    packageName: 'com.rndemo',
                    buildCommand: 'echo "Hello Android"',
                },
            };
            const validate = async () => await (0, config_1.validateSchema)(config);
            await expect(validate()).resolves.toEqual(config);
        });
        it('accepts an ios config that has workspace/scheme but not a buildCommand', async () => {
            const config = {
                ios: {
                    workspace: 'ios/RNDemo.xcworkspace',
                    scheme: 'Test',
                    device: 'iPhone Simulator',
                },
            };
            const validate = async () => await (0, config_1.validateSchema)(config);
            await expect(validate()).resolves.toEqual(config);
        });
        it('accepts an ios config that has buildCommand but not workspace/scheme', async () => {
            const config = {
                ios: {
                    workspace: 'ios/RNDemo.xcworkspace',
                    scheme: 'Test',
                    device: 'iPhone Simulator',
                },
            };
            const validate = async () => await (0, config_1.validateSchema)(config);
            await expect(validate()).resolves.toEqual(config);
        });
        it('accepts a target for iOS', async () => {
            const config = {
                ios: {
                    workspace: 'ios/RNDemo.xcworkspace',
                    scheme: 'Test',
                    configuration: 'Release',
                    device: 'iPhone Simulator',
                },
            };
            const result = await (0, config_1.validateSchema)(config);
            expect(result?.ios?.configuration).toEqual('Release');
        });
        it('defaults the target to Debug for iOS', async () => {
            const config = {
                ios: {
                    workspace: 'ios/RNDemo.xcworkspace',
                    scheme: 'Test',
                    device: 'iPhone Simulator',
                },
            };
            const result = await (0, config_1.validateSchema)(config);
            expect(result?.ios?.configuration).toEqual('Debug');
        });
        it("rejects an ios config that doesn't have either workspace/scheme or buildCommand", async () => {
            const config = { ios: {} };
            const validate = async () => await (0, config_1.validateSchema)(config);
            await expect(validate()).rejects.toContain("should have required property 'workspace'");
            await expect(validate()).rejects.toContain("should have required property 'buildCommand'");
            await expect(validate()).rejects.toContain('should match some schema in anyOf');
        });
        it('rejects an ios config that has a workspace but not a scheme', async () => {
            const config = {
                ios: {
                    workspace: 'ios/RNDemo.xcworkspace',
                    device: 'iPhone Simulator',
                },
            };
            const validate = async () => await (0, config_1.validateSchema)(config);
            await expect(validate()).rejects.toContain("should have required property 'scheme'");
            await expect(validate()).rejects.toContain('should match some schema in anyOf');
        });
        it('rejects an ios config that has a build command but not a binary path', async () => {
            const config = {
                ios: {
                    buildCommand: 'echo "Hello iOS"',
                    device: 'iPhone Simulator',
                },
            };
            const validate = async () => await (0, config_1.validateSchema)(config);
            await expect(validate()).rejects.toContain("should have required property 'binaryPath'");
            await expect(validate()).rejects.toContain('should match some schema in anyOf');
        });
        it('rejects a config that does not have either ios or android options', async () => {
            const config = {};
            const validate = async () => await (0, config_1.validateSchema)(config);
            await expect(validate()).rejects.toContain("should have required property 'ios'");
            await expect(validate()).rejects.toContain("should have required property 'android'");
        });
    });
    describe('readConfigFile', () => {
        it('reads a config file and returns JSON', async () => {
            const buffer = Buffer.from(JSON.stringify({ hello: 'world' }), 'utf8');
            jest.spyOn(fs_1.promises, 'readFile').mockImplementationOnce(async () => buffer);
            const filePath = './my-config.json';
            const result = await (0, config_1.readConfigFile)(filePath);
            expect(result.hello).toBe('world');
        });
        it('reads a config file - invalid file', async () => {
            const filePath = './my-config.json';
            const call = async () => await (0, config_1.readConfigFile)(filePath);
            await expect(call()).rejects.toThrow(`Could not load the config at ${filePath}. For an example see https://formidable.com/open-source/react-native-owl/docs/introduction/config-file/`);
        });
    });
    describe('getConfig', () => {
        it('returns a validated config', async () => {
            const expectedConfig = {
                ios: {
                    workspace: 'ios/RNDemo.xcworkspace',
                    scheme: 'RNDemo',
                    configuration: 'Debug',
                    device: 'iPhone Simulator',
                },
                android: {
                    packageName: 'com.rndemo',
                    buildType: 'Debug',
                },
                debug: false,
                report: true,
            };
            const filePath = './owl.config.json';
            const buffer = Buffer.from(JSON.stringify(expectedConfig), 'utf8');
            jest.spyOn(fs_1.promises, 'readFile').mockImplementationOnce(async () => buffer);
            const result = await (0, config_1.getConfig)(filePath);
            expect(result).toEqual(expectedConfig);
        });
    });
});
