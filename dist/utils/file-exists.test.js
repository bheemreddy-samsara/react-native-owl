"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const file_exists_1 = require("./file-exists");
describe('file-exists.ts', () => {
    const accessMock = jest.spyOn(fs_1.promises, 'access');
    beforeEach(() => {
        accessMock.mockReset();
    });
    it('should check if a file exists - true', async () => {
        accessMock.mockResolvedValueOnce();
        const result = await (0, file_exists_1.fileExists)('./hello.txt');
        expect(result).toBe(true);
    });
    it('should check if a file exists - false', async () => {
        accessMock.mockRejectedValueOnce(undefined);
        const result = await (0, file_exists_1.fileExists)('./file-does-not-exist.txt');
        expect(result).toBe(false);
    });
});
