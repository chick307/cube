import { DirectoryEntry, Entry, FileEntry, SymbolicLinkEntry } from '../../common/entities/entry';
import { FileSystem, LocalFileSystem, ZipContainer, ZipFileSystem } from '../../common/entities/file-system';
import { CloseController } from '../../common/utils/close-controller';
import { EntryPath } from '../../common/values/entry-path';
import { EntryServiceImpl } from './entry-service';
import type { LocalEntryService } from './local-entry-service';
import type { ZipEntryService } from './zip-entry-service';

class UnknownFileSystem extends FileSystem {
    //
}

const dummyLocalEntryService: LocalEntryService = {
    createEntryFromPath: async () => null,
    getHomeDirectoryEntry: () => new DirectoryEntry(new EntryPath('/a')),
    readDirectory: async () => [
        new FileEntry(new EntryPath('/a/c/f')),
    ],
    readFile: async () => Buffer.from('abc'),
    readLink: async () => ({
        entry: new Entry(new EntryPath('/a/e')),
        linkString: '/a/e',
    }),
};

const dummyZipEntryService: ZipEntryService = {
    createEntryFromPath: async () => null,
    readDirectory: async () => [
        new FileEntry(new EntryPath('/d-1/f-1-1')),
    ],
    readFile: async () => Buffer.from('def'),
};

const dummyContainer: ZipContainer = {
    entry: new FileEntry(new EntryPath('/a/b')),
    fileSystem: new UnknownFileSystem(),
};

const createEntryService = () => {
    return new EntryServiceImpl({
        localEntryService: dummyLocalEntryService,
        zipEntryService: dummyZipEntryService,
    });
};


afterEach(() => {
    jest.restoreAllMocks();
});

describe('EntryService type', () => {
    describe('entryService.createEntryFromPath() method', () => {
        test('it calls localEntryService.createEntryFromPath() method, ' +
             'if the local file system is passed', async () => {
            const createEntryFromPath = jest.spyOn(dummyLocalEntryService, 'createEntryFromPath');
            const closeController = new CloseController();
            const { signal } = closeController;
            const entryPath = new EntryPath('/a/b');
            const entryService = createEntryService();
            const fileSystem = new LocalFileSystem();
            const promise1 = entryService.createEntryFromPath({ entryPath, fileSystem });
            await expect(promise1).resolves.toBeNull();
            expect(createEntryFromPath).toHaveBeenCalledTimes(1);
            expect(createEntryFromPath).toHaveBeenCalledWith({ entryPath }, undefined);
            createEntryFromPath.mockClear();
            const promise2 = entryService.createEntryFromPath({ entryPath, fileSystem }, { signal });
            await expect(promise2).resolves.toBeNull();
            expect(createEntryFromPath).toHaveBeenCalledTimes(1);
            expect(createEntryFromPath).toHaveBeenCalledWith({ entryPath }, { signal });
        });

        test('it calls zipEntryService.createEntryFromPath() method, ' +
             'if the zip file system is passed', async () => {
            const createEntryFromPath = jest.spyOn(dummyZipEntryService, 'createEntryFromPath');
            const closeController = new CloseController();
            const { signal } = closeController;
            const entryPath = new EntryPath('/d-1');
            const entryService = createEntryService();
            const container = dummyContainer;
            const fileSystem = new ZipFileSystem({ container });
            const promise1 = entryService.createEntryFromPath({ entryPath, fileSystem });
            await expect(promise1).resolves.toBeNull();
            expect(createEntryFromPath).toHaveBeenCalledTimes(1);
            expect(createEntryFromPath).toHaveBeenCalledWith({ entryPath, entryService, fileSystem }, undefined);
            createEntryFromPath.mockClear();
            const promise2 = entryService.createEntryFromPath({ entryPath, fileSystem }, { signal });
            await expect(promise2).resolves.toBeNull();
            expect(createEntryFromPath).toHaveBeenCalledTimes(1);
            expect(createEntryFromPath).toHaveBeenCalledWith({ entryPath, entryService, fileSystem }, { signal });
        });

        test('it throws an error if the passed file system is unknown', async () => {
            const entryPath = new EntryPath('/x');
            const entryService = createEntryService();
            const fileSystem = new UnknownFileSystem();
            const promise = entryService.createEntryFromPath({ entryPath, fileSystem });
            await expect(promise).rejects.toThrow();
        });
    });

    describe('entryService.readDirectory() method', () => {
        test('it calls localEntryService.readDirectory() method, if the local file system is passed', async () => {
            const closeController = new CloseController();
            const { signal } = closeController;
            const readDirectory = jest.spyOn(dummyLocalEntryService, 'readDirectory');
            const entry = new DirectoryEntry(new EntryPath('/a/c'));
            const fileSystem = new LocalFileSystem();
            const entryService = createEntryService();
            const promise1 = entryService.readDirectory({ entry, fileSystem });
            await expect(promise1).resolves.toEqual([
                new FileEntry(new EntryPath('/a/c/f')),
            ]);
            expect(readDirectory).toHaveBeenCalledWith({ entry }, { signal: undefined });
            readDirectory.mockClear();
            const promise2 = entryService.readDirectory({ entry, fileSystem }, { signal });
            await expect(promise2).resolves.toEqual([
                new FileEntry(new EntryPath('/a/c/f')),
            ]);
            expect(readDirectory).toHaveBeenCalledWith({ entry }, { signal });
        });

        test('it calls zipEntryService.readDirectory() method, if the zip file system is passed', async () => {
            const closeController = new CloseController();
            const { signal } = closeController;
            const readDirectory = jest.spyOn(dummyZipEntryService, 'readDirectory');
            const entry = new DirectoryEntry(new EntryPath('/d-1'));
            const container = dummyContainer;
            const fileSystem = new ZipFileSystem({ container });
            const entryService = createEntryService();
            const promise1 = entryService.readDirectory({ entry, fileSystem });
            await expect(promise1).resolves.toEqual([
                new FileEntry(new EntryPath('/d-1/f-1-1')),
            ]);
            expect(readDirectory).toHaveBeenCalledWith({ entry, entryService, fileSystem }, { signal: undefined });
            readDirectory.mockClear();
            const promise2 = entryService.readDirectory({ entry, fileSystem }, { signal });
            await expect(promise2).resolves.toEqual([
                new FileEntry(new EntryPath('/d-1/f-1-1')),
            ]);
            expect(readDirectory).toHaveBeenCalledWith({ entry, entryService, fileSystem }, { signal });
        });

        test('it throws an error if the passed file system is unknown', async () => {
            const entry = new DirectoryEntry(new EntryPath('/a/c'));
            const fileSystem = new UnknownFileSystem();
            const entryService = createEntryService();
            const promise = entryService.readDirectory({ entry, fileSystem });
            await expect(promise).rejects.toThrow();
        });
    });

    describe('entryService.readFile() method', () => {
        test('it calls localEntryService.readFile() method, if the local file system is passed', async () => {
            const closeController = new CloseController();
            const { signal } = closeController;
            const readFile = jest.spyOn(dummyLocalEntryService, 'readFile');
            const entry = new FileEntry(new EntryPath('/a/b'));
            const fileSystem = new LocalFileSystem();
            const entryService = createEntryService();
            const promise1 = entryService.readFile({ entry, fileSystem });
            await expect(promise1).resolves.toEqual(Buffer.from('abc'));
            expect(readFile).toHaveBeenCalledWith({ entry }, { signal: undefined });
            readFile.mockClear();
            const promise2 = entryService.readFile({ entry, fileSystem }, { signal });
            await expect(promise2).resolves.toEqual(Buffer.from('abc'));
            expect(readFile).toHaveBeenCalledWith({ entry }, { signal });
        });

        test('it calls zipEntryService.readFile() method, if the zip file system is passed', async () => {
            const closeController = new CloseController();
            const { signal } = closeController;
            const readFile = jest.spyOn(dummyZipEntryService, 'readFile');
            const entry = new FileEntry(new EntryPath('/f-1'));
            const container = dummyContainer;
            const fileSystem = new ZipFileSystem({ container });
            const entryService = createEntryService();
            const promise1 = entryService.readFile({ entry, fileSystem });
            await expect(promise1).resolves.toEqual(Buffer.from('def'));
            expect(readFile).toHaveBeenCalledWith({ entry, entryService, fileSystem }, { signal: undefined });
            readFile.mockClear();
            const promise2 = entryService.readFile({ entry, fileSystem }, { signal });
            await expect(promise2).resolves.toEqual(Buffer.from('def'));
            expect(readFile).toHaveBeenCalledWith({ entry, entryService, fileSystem }, { signal });
        });

        test('it throws an error if the passed file system is unknown', async () => {
            const entry = new FileEntry(new EntryPath('/a/c'));
            const fileSystem = new UnknownFileSystem();
            const entryService = createEntryService();
            const promise = entryService.readFile({ entry, fileSystem });
            await expect(promise).rejects.toThrow();
        });
    });

    describe('entryService.readLink() method', () => {
        test('it calls localEntryService.readLink() method, if the local file system is passed', async () => {
            const closeController = new CloseController();
            const { signal } = closeController;
            const readLink = jest.spyOn(dummyLocalEntryService, 'readLink');
            const entry = new SymbolicLinkEntry(new EntryPath('/a/d'));
            const fileSystem = new LocalFileSystem();
            const entryService = createEntryService();
            const promise1 = entryService.readLink({ entry, fileSystem });
            await expect(promise1).resolves.toEqual({
                entry: new Entry(new EntryPath('/a/e')),
                linkString: '/a/e',
            });
            expect(readLink).toHaveBeenCalledWith({ entry }, { signal: undefined });
            readLink.mockClear();
            const promise2 = entryService.readLink({ entry, fileSystem }, { signal });
            await expect(promise2).resolves.toEqual({
                entry: new Entry(new EntryPath('/a/e')),
                linkString: '/a/e',
            });
            expect(readLink).toHaveBeenCalledWith({ entry }, { signal });
        });

        test('it throws an error if the zip file system is passed', async () => {
            const entry = new SymbolicLinkEntry(new EntryPath('/a/d'));
            const container = dummyContainer;
            const fileSystem = new ZipFileSystem({ container });
            const entryService = createEntryService();
            const promise = entryService.readLink({ entry, fileSystem });
            await expect(promise).rejects.toThrow();
        });

        test('it throws an error if the passed file system is unknown', async () => {
            const entry = new SymbolicLinkEntry(new EntryPath('/a/d'));
            const fileSystem = new UnknownFileSystem();
            const entryService = createEntryService();
            const promise = entryService.readLink({ entry, fileSystem });
            await expect(promise).rejects.toThrow();
        });
    });
});
