import { EntryPath } from '../values/entry-path';
import { FileEntry } from './file-entry';
import { FileSystem } from './file-system';
import { LocalFileSystem } from './local-file-system';
import { ZipFileSystem } from './zip-file-system';

describe('ZipFileSystem entity class', () => {
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
