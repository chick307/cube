import { EntryPath } from '../../values/entry-path';
import { FileEntry } from '../entry';
import { FileSystem } from './file-system';
import { LocalFileSystem } from './local-file-system';
import { ZipFileSystem } from './zip-file-system';

describe('ZipFileSystem entity class', () => {
    describe('ZipFileSystem.fromJson() method', () => {
        test('it returns ZipFileSystem instance', () => {
            const fileSystem = ZipFileSystem.fromJson({
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
            expect(() => ZipFileSystem.fromJson(null)).toThrow();
            expect(() => ZipFileSystem.fromJson(undefined)).toThrow();
            expect(() => ZipFileSystem.fromJson({ type: '' })).toThrow();
            expect(() => ZipFileSystem.fromJson({ type: 'local' })).toThrow();
            expect(() => ZipFileSystem.fromJson({ type: 'zip' })).toThrow();
            expect(() => ZipFileSystem.fromJson({ type: 'zip', container: 1 })).toThrow();
            expect(() => ZipFileSystem.fromJson({ type: 'zip', container: {} })).toThrow();
        });
    });

    describe('zipFileSystem.equals() method', () => {
        test('it returns if the passed file system equals self', () => {
            const containerA = { entry: new FileEntry(new EntryPath('/a/a')), fileSystem: new LocalFileSystem() };
            const containerB = { entry: new FileEntry(new EntryPath('/a/b')), fileSystem: new LocalFileSystem() };
            const zipFileSystemA = new ZipFileSystem({ container: containerA });
            const zipFileSystemB = new ZipFileSystem({ container: containerB });
            expect(zipFileSystemA.equals(zipFileSystemA)).toBe(true);
            expect(zipFileSystemB.equals(zipFileSystemB)).toBe(true);
            expect(zipFileSystemA.equals(new ZipFileSystem({ container: containerA }))).toBe(true);
            expect(zipFileSystemB.equals(new ZipFileSystem({ container: containerB }))).toBe(true);
            expect(zipFileSystemA.equals(zipFileSystemB)).toBe(true);
            expect(zipFileSystemA.equals(new ZipFileSystem({ container: containerB }))).toBe(true);
            expect(zipFileSystemB.equals(zipFileSystemA)).toBe(true);
            expect(zipFileSystemB.equals(new ZipFileSystem({ container: containerA }))).toBe(true);
            expect(zipFileSystemA.equals(new FileSystem())).toBe(false);
            expect(zipFileSystemB.equals(new FileSystem())).toBe(false);
        });
    });

    describe('zipFileSystem.isZip() method', () => {
        test('it returns true', () => {
            const zipFileSystem = new ZipFileSystem({
                container: {
                    entry: new FileEntry(new EntryPath('/a/b')),
                    fileSystem: new LocalFileSystem(),
                },
            });
            expect(zipFileSystem.isZip()).toBe(true);
        });
    });

    describe('zipFileSystem.toJson() method', () => {
        test('it returns JSON object', () => {
            const zipFileSystem = new ZipFileSystem({
                container: {
                    entry: new FileEntry(new EntryPath('/a/b')),
                    fileSystem: new LocalFileSystem(),
                },
            });
            expect(zipFileSystem.toJson()).toEqual({
                type: 'zip',
                container: {
                    entry: {
                        type: 'file',
                        path: '/a/b',
                    },
                    fileSystem: {
                        type: 'local',
                    },
                },
            });
        });
    });
});

describe('fileSystme.isZip() method', () => {
    test('it returns false', () => {
        const fileSystem = new FileSystem();
        expect(fileSystem.isZip()).toBe(false);
    });
});
