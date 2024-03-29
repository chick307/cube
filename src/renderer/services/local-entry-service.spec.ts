import { promises as fs } from 'fs';

import { ipcRenderer } from 'electron';

import { DirectoryEntry } from '../../common/entities/directory-entry';
import { Entry } from '../../common/entities/entry';
import { FileEntry } from '../../common/entities/file-entry';
import { SymbolicLinkEntry } from '../../common/entities/symbolic-link-entry';
import { CloseController, Closed } from '../../common/utils/close-controller';
import { EntryPath } from '../../common/values/entry-path';
import { LocalEntryServiceImpl } from './local-entry-service';

const createStats = () => ({
    isDirectory: () => false,
    isFile: () => false,
    isSymbolicLink: () => false,
});

const createDirectoryStats = () => ({
    ...createStats(),
    isDirectory: () => true,
});

const createFileStats = () => ({
    ...createStats(),
    isFile: () => true,
});

const createSymbolicLinkStats = () => ({
    ...createStats(),
    isSymbolicLink: () => true,
});

describe('LocalEntryService type', () => {
    beforeEach(() => {
        const lstat = jest.spyOn(fs, 'lstat');
        lstat.mockImplementation(async (path) => {
            if (path === '/a/b')
                return createFileStats() as any;
            if (path === '/a/c')
                return createDirectoryStats() as any;
            if (path === '/a/d')
                return createSymbolicLinkStats() as any;
            if (path === '/a/e')
                return createStats() as any;
            return {} as any;
        });

        const readdir = jest.spyOn(fs, 'readdir');
        readdir.mockImplementation(async () => {
            return ['b', 'c', 'd', 'e'] as any[];
        });

        const readFile = jest.spyOn(fs, 'readFile');
        readFile.mockImplementation(async () => {
            return Buffer.from('abc');
        });

        const readlink = jest.spyOn(fs, 'readlink');
        readlink.mockImplementation(async () => {
            return '/a/b';
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('localEntryService.getHomeDirectoryEntry() method', () => {
        test('it returns the entry of the home directory', () => {
            const sendSync = jest.spyOn(ipcRenderer, 'sendSync');
            sendSync.mockImplementation((channel) => {
                expect(channel).toBe('path.home');
                return '/path/to/home';
            });
            const localEntryService = new LocalEntryServiceImpl();
            const result = localEntryService.getHomeDirectoryEntry();
            expect(result).toEqual(new DirectoryEntry(new EntryPath('/path/to/home')));
        });
    });

    describe('localEntryService.readDirectory() method', () => {
        test('it returns the entries in the directory', async () => {
            const localEntryService = new LocalEntryServiceImpl();
            const entry = new DirectoryEntry(new EntryPath('/a'));
            const promise = localEntryService.readDirectory({ entry });
            await expect(promise).resolves.toEqual([
                new FileEntry(new EntryPath('/a/b')),
                new DirectoryEntry(new EntryPath('/a/c')),
                new SymbolicLinkEntry(new EntryPath('/a/d')),
                new Entry(new EntryPath('/a/e')),
            ]);
        });

        test('it throws if the passed signal is closed', async () => {
            const closeController = new CloseController();
            closeController.close();
            const { signal } = closeController;
            const localEntryService = new LocalEntryServiceImpl();
            const entry = new DirectoryEntry(new EntryPath('/a'));
            const promise = localEntryService.readDirectory({ entry }, { signal });
            await expect(promise).rejects.toBeInstanceOf(Closed);
        });

        test('it throws if the passed signal is closed even after called', async () => {
            const closeController = new CloseController();
            closeController.close();
            const { signal } = closeController;
            const localEntryService = new LocalEntryServiceImpl();
            const entry = new DirectoryEntry(new EntryPath('/a'));
            const promise = localEntryService.readDirectory({ entry }, { signal });
            await expect(promise).rejects.toBeInstanceOf(Closed);
        });
    });

    describe('localEntryService.readFile() method', () => {
        test('it returns the contents of the file', async () => {
            const localEntryService = new LocalEntryServiceImpl();
            const entry = new FileEntry(new EntryPath('/a/b'));
            const promise = localEntryService.readFile({ entry });
            await expect(promise).resolves.toEqual(Buffer.from('abc'));
        });

        test('it throws if the passed signal is closed', async () => {
            const closeController = new CloseController();
            closeController.close();
            const { signal } = closeController;
            const localEntryService = new LocalEntryServiceImpl();
            const entry = new FileEntry(new EntryPath('/a/b'));
            const promise = localEntryService.readFile({ entry }, { signal });
            await expect(promise).rejects.toBeInstanceOf(Closed);
        });

        test('it throws if the passed signal is closed even after called', async () => {
            const closeController = new CloseController();
            const { signal } = closeController;
            const localEntryService = new LocalEntryServiceImpl();
            const entry = new FileEntry(new EntryPath('/a/b'));
            const promise = localEntryService.readFile({ entry }, { signal });
            closeController.close();
            await expect(promise).rejects.toBeInstanceOf(Closed);
        });
    });

    describe('localEntryService.readLink() method', () => {
        test('it returns the entry of the file', async () => {
            const localEntryService = new LocalEntryServiceImpl();
            const linkedEntry = new FileEntry(new EntryPath('/a/b'));
            const entry = new SymbolicLinkEntry(new EntryPath('/a/d'));
            const promise = localEntryService.readLink({ entry });
            await expect(promise).resolves.toEqual({
                entry: linkedEntry,
                linkString: '/a/b',
            });
        });

        test('it returns null if failed on obtaining status', async () => {
            jest.spyOn(fs, 'lstat').mockReturnValue(Promise.reject(Error()));
            const localEntryService = new LocalEntryServiceImpl();
            const entry = new SymbolicLinkEntry(new EntryPath('/a/d'));
            const promise = localEntryService.readLink({ entry });
            await expect(promise).resolves.toEqual({
                entry: null,
                linkString: '/a/b',
            });
        });

        test('it throws if the passed signal is closed', async () => {
            const closeController = new CloseController();
            closeController.close();
            const { signal } = closeController;
            const localEntryService = new LocalEntryServiceImpl();
            const entry = new SymbolicLinkEntry(new EntryPath('/a/d'));
            const promise = localEntryService.readLink({ entry }, { signal });
            await expect(promise).rejects.toBeInstanceOf(Closed);
        });

        test('it throws if the passed signal is closed even after called', async () => {
            const closeController = new CloseController();
            const { signal } = closeController;
            const localEntryService = new LocalEntryServiceImpl();
            const entry = new SymbolicLinkEntry(new EntryPath('/a/d'));
            const promise = localEntryService.readLink({ entry }, { signal });
            closeController.close();
            await expect(promise).rejects.toBeInstanceOf(Closed);
        });
    });
});

