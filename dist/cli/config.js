"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = exports.readConfigFile = exports.validateSchema = void 0;
const fs_1 = require("fs");
const ajv_1 = __importDefault(require("ajv"));
const validateSchema = (config) => {
    const configSchema = {
        type: 'object',
        properties: {
            ios: {
                type: 'object',
                properties: {
                    workspace: { type: 'string', nullable: true },
                    configuration: { type: 'string', nullable: true, default: 'Debug' },
                    scheme: { type: 'string', nullable: true },
                    buildCommand: { type: 'string', nullable: true },
                    binaryPath: { type: 'string', nullable: true },
                    device: { type: 'string' },
                    quiet: { type: 'boolean', nullable: true },
                },
                required: ['device'],
                anyOf: [
                    { required: ['workspace', 'scheme'] },
                    { required: ['buildCommand', 'binaryPath'] },
                ],
                nullable: true,
                additionalProperties: false,
            },
            android: {
                type: 'object',
                properties: {
                    packageName: { type: 'string' },
                    buildCommand: { type: 'string', nullable: true },
                    buildType: { type: 'string', nullable: true, default: 'Release' },
                    binaryPath: { type: 'string', nullable: true },
                    quiet: { type: 'boolean', nullable: true },
                },
                required: ['packageName'],
                anyOf: [{ required: [] }, { required: ['buildCommand', 'binaryPath'] }],
                nullable: true,
                additionalProperties: false,
            },
            debug: { type: 'boolean', nullable: true, default: false },
            report: { type: 'boolean', nullable: true, default: true },
        },
        required: [],
        anyOf: [{ required: ['ios'] }, { required: ['android'] }],
        additionalProperties: false,
    };
    const ajv = new ajv_1.default({ useDefaults: true });
    const validate = ajv.compile(configSchema);
    return new Promise((resolve, reject) => {
        if (validate(config)) {
            resolve(config);
        }
        else {
            const errorMessage = validate
                .errors.map((err) => `${err.schemaPath}: ${err.message}`)
                .join(' ');
            reject(errorMessage);
        }
    });
};
exports.validateSchema = validateSchema;
const readConfigFile = async (configPath) => {
    try {
        const configData = await fs_1.promises.readFile(configPath, 'binary');
        const configString = Buffer.from(configData).toString();
        const parsedConfig = JSON.parse(configString);
        return parsedConfig;
    }
    catch (err) {
        throw new Error(`Could not load the config at ${configPath}. For an example see https://formidable.com/open-source/react-native-owl/docs/introduction/config-file/`);
    }
};
exports.readConfigFile = readConfigFile;
const getConfig = async (configPath) => {
    const config = await (0, exports.readConfigFile)(configPath);
    return await (0, exports.validateSchema)(config);
};
exports.getConfig = getConfig;
