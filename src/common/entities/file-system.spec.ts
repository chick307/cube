import { FileSystem } from './file-system';

describe('FileSystem class', () => {
    describe('fileSystem.toJson() method', () => {
        test('it returns JSON object', () => {
            const fileSystem = new FileSystem();
            expect(fileSystem.toJson()).toEqual({});
        });
    });
});
