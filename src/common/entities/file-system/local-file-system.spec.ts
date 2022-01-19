import { DummyFileSystem } from './file-system.test-helper';
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

    describe('localFileSystem.equals() method', () => {
        test('it returns if the passed file system equals self', () => {
            const localFileSystemA = new LocalFileSystem();
            const localFileSystemB = new LocalFileSystem();
            expect(localFileSystemA.equals(localFileSystemA)).toBe(true);
            expect(localFileSystemB.equals(localFileSystemB)).toBe(true);
            expect(localFileSystemA.equals(localFileSystemB)).toBe(true);
            expect(localFileSystemB.equals(localFileSystemA)).toBe(true);
            expect(localFileSystemA.equals(new LocalFileSystem())).toBe(true);
            expect(localFileSystemB.equals(new LocalFileSystem())).toBe(true);
            expect(localFileSystemA.equals(new DummyFileSystem())).toBe(false);
            expect(localFileSystemB.equals(new DummyFileSystem())).toBe(false);
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
        const fileSystem = new DummyFileSystem();
        expect(fileSystem.isLocal()).toBe(false);
    });
});
