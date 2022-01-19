import { promises as fs } from 'fs';
import path from 'path';

import { DirectoryEntry, FileEntry } from '../../common/entities/entry';
import { DummyEntry } from '../../common/entities/entry.test-helper';
import { FileSystem } from '../../common/entities/file-system';
import { ZipFileSystem } from '../../common/entities/file-system';
import { CloseController, Closed } from '../../common/utils/close-controller';
import { EntryPath } from '../../common/values/entry-path';
import type { EntryService } from './entry-service';
import { createEntryService } from './entry-service.test-helper';
import { ZipEntryServiceImpl } from './zip-entry-service';

const dummyFileSystem = new FileSystem();

let entryService: EntryService;

beforeEach(() => {
    ({ entryService } = createEntryService());

    jest.spyOn(entryService, 'readFile').mockImplementation(async (params) => {
        expect(params.entry.path.toString()).toBe('/path/to/zip');
        const buffer = await fs.readFile(path.resolve(__dirname, './fixtures/a.zip'));
        return buffer;
    });

    jest.spyOn(entryService, 'readLink').mockImplementation(async () => {
        const entry = new DummyEntry(new EntryPath('/a/e'));
        const linkString = '/a/e';
        return { entry, linkString };
    });
});

afterEach(() => {
    entryService = null!;
});

const dummyContainer = {
    entry: new FileEntry(new EntryPath('/path/to/zip')),
    fileSystem: dummyFileSystem,
};

describe('ZipEntryService type', () => {
    describe('zipEntryService.createEntryFromPath() method', () => {
        test('it returns the entry of the path', async () => {
            const fileSystem = new ZipFileSystem({ container: dummyContainer });
            const zipEntryService = new ZipEntryServiceImpl();
            await expect(zipEntryService.createEntryFromPath({
                entryPath: new EntryPath('/d-1/f-1-1'),
                entryService,
                fileSystem,
            })).resolves.toEqual(new FileEntry(new EntryPath('/d-1/f-1-1')));
            await expect(zipEntryService.createEntryFromPath({
                entryPath: new EntryPath('/d-1/d-1-1'),
                entryService,
                fileSystem,
            })).resolves.toEqual(new DirectoryEntry(new EntryPath('/d-1/d-1-1')));
        });

        test('it returns null if the path does not exist', async () => {
            const fileSystem = new ZipFileSystem({ container: dummyContainer });
            const zipEntryService = new ZipEntryServiceImpl();
            await expect(zipEntryService.createEntryFromPath({
                entryPath: new EntryPath('/d-1/f-404'),
                entryService,
                fileSystem,
            })).resolves.toEqual(null);
        });

        test('it throws if the passed signal is closed', async () => {
            const closeController = new CloseController();
            closeController.close();
            const { signal } = closeController;
            const fileSystem = new ZipFileSystem({ container: dummyContainer });
            const zipEntryService = new ZipEntryServiceImpl();
            const promise = zipEntryService.createEntryFromPath({
                entryPath: new EntryPath('/d-1/f-404'),
                entryService,
                fileSystem,
                signal,
            });
            await expect(promise).rejects.toBeInstanceOf(Closed);
        });

        test('it throws if the passed signal is closed even after called', async () => {
            const closeController = new CloseController();
            const { signal } = closeController;
            const fileSystem = new ZipFileSystem({ container: dummyContainer });
            const zipEntryService = new ZipEntryServiceImpl();
            const promise = zipEntryService.createEntryFromPath({
                entryPath: new EntryPath('/d-1/f-404'),
                entryService,
                fileSystem,
                signal,
            });
            closeController.close();
            await expect(promise).rejects.toBeInstanceOf(Closed);
        });
    });

    describe('zipEntryService.readDirectory() method', () => {
        test('it returns the entries in the directory', async () => {
            const entry = new DirectoryEntry(new EntryPath('/d-1'));
            const fileSystem = new ZipFileSystem({ container: dummyContainer });
            const zipEntryService = new ZipEntryServiceImpl();
            const promise = zipEntryService.readDirectory({ entry, entryService, fileSystem });
            await expect(promise).resolves.toEqual([
                new FileEntry(new EntryPath('/d-1/f-1-1')),
                new DirectoryEntry(new EntryPath('/d-1/d-1-1')),
            ]);
        });

        test('it throws if the passed signal is closed', async () => {
            const closeController = new CloseController();
            closeController.close();
            const { signal } = closeController;
            const entry = new DirectoryEntry(new EntryPath('/d-1'));
            const fileSystem = new ZipFileSystem({ container: dummyContainer });
            const zipEntryService = new ZipEntryServiceImpl();
            const promise = zipEntryService.readDirectory({ entry, entryService, fileSystem, signal });
            await expect(promise).rejects.toBeInstanceOf(Closed);
        });

        test('it throws if the passed signal is closed even after called', async () => {
            const closeController = new CloseController();
            const { signal } = closeController;
            const entry = new DirectoryEntry(new EntryPath('/d-1'));
            const fileSystem = new ZipFileSystem({ container: dummyContainer });
            const zipEntryService = new ZipEntryServiceImpl();
            const promise = zipEntryService.readDirectory({ entry, entryService, fileSystem, signal });
            closeController.close();
            await expect(promise).rejects.toBeInstanceOf(Closed);
        });
    });

    describe('zipEntryService.readFile() method', () => {
        test('it returns the contents of the file entry', async () => {
            const closeController = new CloseController();
            const { signal } = closeController;
            const entry1 = new FileEntry(new EntryPath('/f-1'));
            const entry2 = new FileEntry(new EntryPath('/d-1/f-1-1'));
            const fileSystem = new ZipFileSystem({ container: dummyContainer });
            const zipEntryService = new ZipEntryServiceImpl();
            const promise1 = zipEntryService.readFile({ entry: entry1, entryService, fileSystem });
            await expect(promise1).resolves.toEqual(Buffer.from('abc\n'));
            const promise2 = zipEntryService.readFile({ entry: entry2, entryService, fileSystem }, { signal });
            await expect(promise2).resolves.toEqual(Buffer.from('def\n'));
            const promise3 = zipEntryService.readFile({ entry: entry1, entryService, fileSystem });
            await expect(promise3).resolves.toEqual(Buffer.from('abc\n'));
            closeController.close();
        });

        test('it throws if the passed signal is closed', async () => {
            const closeController = new CloseController();
            closeController.close();
            const { signal } = closeController;
            const entry = new FileEntry(new EntryPath('/d-1/f-1-1'));
            const fileSystem = new ZipFileSystem({ container: dummyContainer });
            const zipEntryService = new ZipEntryServiceImpl();
            const promise = zipEntryService.readFile({ entry, entryService, fileSystem }, { signal });
            await expect(promise).rejects.toBeInstanceOf(Closed);
        });

        test('it throws if the passed signal is closed even after called', async () => {
            const closeController = new CloseController();
            const { signal } = closeController;
            const entry = new FileEntry(new EntryPath('/d-1/f-1-1'));
            const fileSystem = new ZipFileSystem({ container: dummyContainer });
            const zipEntryService = new ZipEntryServiceImpl();
            const promise = zipEntryService.readFile({ entry, entryService, fileSystem }, { signal });
            closeController.close();
            await expect(promise).rejects.toBeInstanceOf(Closed);
        });
    });
});
