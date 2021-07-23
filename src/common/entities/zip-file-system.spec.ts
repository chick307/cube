import { EntryPath } from '../values/entry-path';
import { FileEntry } from './file-entry';
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
