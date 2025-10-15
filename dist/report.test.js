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
const process_1 = __importDefault(require("process"));
const handlebars_1 = __importDefault(require("handlebars"));
const fs_1 = require("fs");
const fileExists = __importStar(require("./utils/file-exists"));
const logger_1 = require("./logger");
const report_1 = require("./report");
describe('report.ts', () => {
    const logger = new logger_1.Logger();
    const htmlTemplate = '<h1>Hello World<h1>';
    const readdirMock = jest.spyOn(fs_1.promises, 'readdir');
    const mkdirMock = jest.spyOn(fs_1.promises, 'mkdir');
    const readFileMock = jest.spyOn(fs_1.promises, 'readFile');
    const writeFileMock = jest.spyOn(fs_1.promises, 'writeFile');
    const cwdMock = jest
        .spyOn(process_1.default, 'cwd')
        .mockReturnValue('/Users/johndoe/Projects/my-project');
    beforeEach(() => {
        writeFileMock.mockReset();
    });
    afterEach(() => {
        cwdMock.mockRestore();
        jest.resetAllMocks();
    });
    it('should get the screenshots and create the html report', async () => {
        jest.spyOn(fileExists, 'fileExists').mockResolvedValue(true);
        const handlebarsCompileMock = jest
            .spyOn(handlebars_1.default, 'compile')
            .mockImplementationOnce(() => () => '<h1>Hello World Compiled</h1>');
        readFileMock
            .mockResolvedValueOnce('{}')
            .mockResolvedValueOnce(htmlTemplate);
        mkdirMock.mockResolvedValue(undefined);
        readdirMock.mockResolvedValue([]);
        await (0, report_1.generateReport)(logger, 'ios');
        expect(readdirMock).toHaveBeenCalledWith('/Users/johndoe/Projects/my-project/.owl/diff/ios');
        expect(readdirMock).toHaveBeenCalledWith('/Users/johndoe/Projects/my-project/.owl/baseline/ios');
        expect(handlebarsCompileMock).toHaveBeenCalledTimes(1);
        expect(writeFileMock).toHaveBeenCalledWith('/Users/johndoe/Projects/my-project/.owl/report/index.html', '<h1>Hello World Compiled</h1>');
    });
    it('should not generate the report if there is no baseline screenshots directory', async () => {
        jest.spyOn(fileExists, 'fileExists').mockResolvedValue(false);
        const handlebarsCompileMock = jest
            .spyOn(handlebars_1.default, 'compile')
            .mockImplementationOnce(() => () => '<h1>Hello World Compiled</h1>');
        readFileMock
            .mockResolvedValueOnce('{}')
            .mockResolvedValueOnce(htmlTemplate);
        mkdirMock.mockResolvedValue(undefined);
        readdirMock.mockResolvedValue([]);
        await (0, report_1.generateReport)(logger, 'ios');
        expect(readdirMock).not.toHaveBeenCalled();
        expect(readdirMock).not.toHaveBeenCalled();
        expect(handlebarsCompileMock).toHaveBeenCalledTimes(0);
        expect(writeFileMock).not.toHaveBeenCalled();
    });
});
