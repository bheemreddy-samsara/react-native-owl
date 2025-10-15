"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReport = exports.cleanupReport = void 0;
const path_1 = __importDefault(require("path"));
const handlebars_1 = __importDefault(require("handlebars"));
const fs_1 = require("fs");
const file_exists_1 = require("./utils/file-exists");
const cleanupReport = async () => {
    const cwd = process.cwd();
    const reportDirPath = path_1.default.join(cwd, '.owl', 'report');
    await fs_1.promises.rm(reportDirPath, { recursive: true, force: true });
};
exports.cleanupReport = cleanupReport;
const generateReport = async (logger, platform) => {
    const cwd = process.cwd();
    const reportDirPath = path_1.default.join(cwd, '.owl', 'report');
    const jestOutputFilepath = path_1.default.join(reportDirPath, 'jest-report.json');
    const jestOutputText = await fs_1.promises.readFile(jestOutputFilepath, 'utf8');
    const jestOutput = JSON.parse(jestOutputText);
    const diffScreenshotsDirPath = path_1.default.join(cwd, '.owl', 'diff', platform);
    const baselineScreenshotsDirPath = path_1.default.join(cwd, '.owl', 'baseline', platform);
    const baselineScreenshotsDirExists = await (0, file_exists_1.fileExists)(baselineScreenshotsDirPath);
    if (!baselineScreenshotsDirExists) {
        logger.print(`[OWL - CLI] Generating report skipped as is no baseline screenshots directory`);
        return;
    }
    const baselineScreenshots = await fs_1.promises.readdir(baselineScreenshotsDirPath);
    const failingScreenshots = (await (0, file_exists_1.fileExists)(diffScreenshotsDirPath))
        ? await fs_1.promises.readdir(diffScreenshotsDirPath)
        : [];
    const passingScreenshots = baselineScreenshots.filter((screenshot) => !failingScreenshots.includes(screenshot));
    const duration = (Date.now() - jestOutput.startTime) / 1000;
    const durationFormatted = parseFloat(`${duration}`).toFixed(2);
    const stats = {
        totalTestSuites: jestOutput.numTotalTestSuites,
        totalTests: jestOutput.numTotalTests,
        failedTestSuites: jestOutput.numFailedTestSuites,
        failedTests: jestOutput.numFailedTests,
        passedTestSuites: jestOutput.numPassedTestSuites,
        passedTests: jestOutput.numPassedTests,
        duration: durationFormatted,
        success: jestOutput.success,
    };
    logger.info(`[OWL - CLI] Generating Report`);
    const reportFilename = 'index.html';
    const entryFile = path_1.default.join(__dirname, 'report', reportFilename);
    const htmlTemplate = await fs_1.promises.readFile(entryFile, 'utf-8');
    const templateScript = handlebars_1.default.compile(htmlTemplate);
    const htmlContent = templateScript({
        currentYear: new Date().getFullYear(),
        currentDateTime: new Date().toUTCString(),
        platform,
        failingScreenshots,
        passingScreenshots,
        stats,
    });
    await fs_1.promises.mkdir(reportDirPath, { recursive: true });
    const reportFilePath = path_1.default.join(reportDirPath, 'index.html');
    await fs_1.promises.writeFile(reportFilePath, htmlContent);
    logger.print(`[OWL - CLI] Report was built at ${reportDirPath}/${reportFilename}`);
};
exports.generateReport = generateReport;
