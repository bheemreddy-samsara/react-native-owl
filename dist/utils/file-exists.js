"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileExists = void 0;
const fs_1 = require("fs");
const fileExists = async (filePath) => {
    try {
        await fs_1.promises.access(filePath);
        return true;
    }
    catch {
        return false;
    }
};
exports.fileExists = fileExists;
