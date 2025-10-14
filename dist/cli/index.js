#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yargs_1 = __importDefault(require("yargs"));
const { hideBin } = require('yargs/helpers');
const argv = (0, yargs_1.default)(hideBin(process.argv));
const build_1 = require("./build");
const run_1 = require("./run");
const plaformOption = {
    alias: 'p',
    describe: 'Platform to build and run the app',
    demandOption: true,
    choices: ['ios', 'android'],
};
const configOption = {
    alias: 'c',
    describe: 'Configuration file to be used',
    type: 'string',
    default: './owl.config.json',
};
const updateOption = {
    alias: 'u',
    describe: 'Update the baseline screenshots',
    type: 'boolean',
    default: false,
};
const testNamePattern = {
    alias: 't',
    describe: 'Run only tests with a name that matches the regex',
    type: 'string',
};
const testPathPatternOption = {
    alias: 'tp',
    describe: 'Run Test for a matching path pattern',
    type: 'string',
    default: '',
};
const builderOptionsRun = {
    config: configOption,
    platform: plaformOption,
};
const builderOptionsTest = {
    config: configOption,
    platform: plaformOption,
    update: updateOption,
    testNamePattern: testNamePattern,
    testPathPattern: testPathPatternOption,
};
argv
    .usage('Usage: $0 <command> [options]')
    .command({
    command: 'build',
    describe: 'Build the React Native project',
    builder: builderOptionsRun,
    handler: build_1.buildHandler,
})
    .command({
    command: 'test',
    describe: 'Runs the test suite',
    builder: builderOptionsTest,
    handler: run_1.runHandler,
})
    .help('help')
    .alias('h', 'help')
    .showHelpOnFail(false, 'Specify --help for available options')
    .alias('v', 'version').argv;
