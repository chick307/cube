import { DirectoryEntry } from '../../common/entities/directory-entry';
import { Entry } from '../../common/entities/entry';
import { FileEntry } from '../../common/entities/file-entry';
import { FileSystem } from '../../common/entities/file-system';
import { LocalFileSystem } from '../../common/entities/local-file-system';
import { SymbolicLinkEntry } from '../../common/entities/symbolic-link-entry';
import { CloseController } from '../../common/utils/close-controller';
import { EntryPath } from '../../common/values/entry-path';
import { EntryServiceImpl } from './entry-service';
import { LocalEntryService } from './local-entry-service';

class UnknownFileSystem extends FileSystem {
    //
}

const dummyLocalEntryService: LocalEntryService = {
    readDirectory: async () => [
        new FileEntry(new EntryPath('/a/c/f')),
    ],
    readFile: async () => Buffer.from('abc'),
    readLink: async () => new Entry(new EntryPath('/a/e')),
};

const createEntryService = () => {
    return new EntryServiceImpl({
        localEntryService: dummyLocalEntryService,
    });
};


afterEach(() => {
    jest.restoreAllMocks();
});

describe('EntryService type', () => {
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
            await expect(promise1).resolves.toEqual(new Entry(new EntryPath('/a/e')));
            expect(readLink).toHaveBeenCalledWith({ entry }, { signal: undefined });
            readLink.mockClear();
            const promise2 = entryService.readLink({ entry, fileSystem }, { signal });
            await expect(promise2).resolves.toEqual(new Entry(new EntryPath('/a/e')));
            expect(readLink).toHaveBeenCalledWith({ entry }, { signal });
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
