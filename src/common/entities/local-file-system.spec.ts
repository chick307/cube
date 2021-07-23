import { FileSystem } from './file-system';
import { LocalFileSystem } from './local-file-system';

describe('LocalFileSystem entity class', () => {
    describe('LocalFileSystem.fromJson() method', () => {
        test('it returns LocalFileSystem instance', () => {
            const fileSystem = LocalFileSystem.fromJson({ type: 'local' });
            expect(fileSystem).toEqual(new LocalFileSystem());
        });

        test('it throws an error if invalid value is passed', () => {
            expect(() => LocalFileSystem.fromJson(null)).toThrow();
            expect(() => LocalFileSystem.fromJson(undefined)).toThrow();
            expect(() => LocalFileSystem.fromJson({ type: '' })).toThrow();
            expect(() => LocalFileSystem.fromJson({ type: 'zip' })).toThrow();
        });
    });

    describe('localFileSystem.isLocal() method', () => {
        test('it returns true', () => {
            const localFileSystem = new LocalFileSystem();
            expect(localFileSystem.isLocal()).toBe(true);
        });
    });

    describe('localFileSystem.toJson() method', () => {
        test('it returns JSON object', () => {
            const localFileSystem = new LocalFileSystem();
            expect(localFileSystem.toJson()).toEqual({ type: 'local' });
        });
    });
});

describe('fileSystme.isLocal() method', () => {
    test('it returns false', () => {
        const fileSystem = new FileSystem();
        expect(fileSystem.isLocal()).toBe(false);
    });
});
