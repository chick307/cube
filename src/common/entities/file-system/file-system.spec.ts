import { EntryPath } from '../../values/entry-path';
import { FileEntry } from '../entry';
import { FileSystem } from './file-system';
import { DummyFileSystem } from './file-system.test-helper';
import { LocalFileSystem } from './local-file-system';
import { ZipFileSystem } from './zip-file-system';

describe('FileSystem class', () => {
    describe('FileSystem.fromJson() method', () => {
        test('it returns local file system entity if the type property is "local"', () => {
            const fileSystem = FileSystem.fromJson({ type: 'local' });
            expect(fileSystem).toEqual(new LocalFileSystem());
        });

        test('it returns zip file system entity if the type property is "zip"', () => {
            const fileSystem = FileSystem.fromJson({
                type: 'zip',
                container: {
                    entry: { type: 'file', path: '/a/b/c' },
                    fileSystem: { type: 'local' },
                },
            });
            expect(fileSystem).toEqual(new ZipFileSystem({
                container: {
                    entry: new FileEntry(new EntryPath('/a/b/c')),
                    fileSystem: new LocalFileSystem(),
                },
            }));
        });

        test('it throws an error if invalid value is passed', () => {
            expect(() => FileSystem.fromJson(null)).toThrow();
            expect(() => FileSystem.fromJson(undefined)).toThrow();
            expect(() => FileSystem.fromJson({ type: '' })).toThrow();
        });
    });

    describe('fileSystem.equals() method', () => {
        test('it returns if the passed file system equals self', () => {
            const fileSystemA = new DummyFileSystem();
            const fileSystemB = new DummyFileSystem();
            expect(fileSystemA.equals(fileSystemA)).toBe(true);
            expect(fileSystemB.equals(fileSystemB)).toBe(true);
            expect(fileSystemA.equals(fileSystemB)).toBe(false);
            expect(fileSystemB.equals(fileSystemA)).toBe(false);
            expect(fileSystemA.equals(new DummyFileSystem())).toBe(false);
            expect(fileSystemB.equals(new DummyFileSystem())).toBe(false);
            expect(fileSystemA.equals(null)).toBe(false);
            expect(fileSystemA.equals(undefined)).toBe(false);
            expect(fileSystemB.equals(null)).toBe(false);
            expect(fileSystemB.equals(undefined)).toBe(false);
        });
    });

    describe('fileSystem.toJson() method', () => {
        test('it returns JSON object', () => {
            const fileSystem = new DummyFileSystem();
            expect(fileSystem.toJson()).toEqual({});
        });
    });
});
