import { FileSystem } from './file-system';
import { LocalFileSystem } from './local-file-system';

describe('LocalFileSystem entity class', () => {
    describe('localFileSystem.isLocal() method', () => {
        test('it returns true', () => {
            const localFileSystem = new LocalFileSystem();
            expect(localFileSystem.isLocal()).toBe(true);
        });
    });
});

describe('fileSystme.isLocal() method', () => {
    test('it returns false', () => {
        const fileSystem = new FileSystem();
        expect(fileSystem.isLocal()).toBe(false);
    });
});
