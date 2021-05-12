import { ipcRenderer } from 'electron';

import { DirectoryEntry } from '../../common/entities/directory-entry';
import { FileEntry } from '../../common/entities/file-entry';
import { CloseController, Closed } from '../../common/utils/close-controller';
import { EntryPath } from '../../common/values/entry-path';
import { EntryIconServiceImpl } from './entry-icon-service';

describe('EntryIconService type', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('entryIconService.getDirectoryEntryIconUrl() method', () => {
        test('it returns the icon URL of the directory entry', async () => {
            const invoke = jest.spyOn(ipcRenderer, 'invoke');
            invoke.mockImplementation(async (channel, arg) => {
                expect(channel).toBe('icon.getDirectoryIconDataUrl');
                expect(arg).toBe('/a');
                return 'data:image/png;base64,AAAA';
            });
            const entry = new DirectoryEntry(new EntryPath('/a'));
            const entryIconService = new EntryIconServiceImpl();
            const result = await entryIconService.getDirectoryEntryIconUrl(entry);
            expect(result).toBe('data:image/png;base64,AAAA');
        });

        test('it throws if the passed signal is closed', async () => {
            const closeController = new CloseController();
            closeController.close();
            const { signal } = closeController;
            const invoke = jest.spyOn(ipcRenderer, 'invoke');
            invoke.mockImplementation(async (channel, arg) => {
                expect(channel).toBe('icon.getDirectoryIconDataUrl');
                expect(arg).toBe('/a');
                return 'data:image/png;base64,AAAA';
            });
            const entry = new DirectoryEntry(new EntryPath('/a'));
            const entryIconService = new EntryIconServiceImpl();
            const promise = entryIconService.getDirectoryEntryIconUrl(entry, { signal });
            await expect(promise).rejects.toBeInstanceOf(Closed);
        });

        test('it throws if the passed signal is closed even after called', async () => {
            const closeController = new CloseController();
            const { signal } = closeController;
            const invoke = jest.spyOn(ipcRenderer, 'invoke');
            invoke.mockImplementation(async (channel, arg) => {
                expect(channel).toBe('icon.getDirectoryIconDataUrl');
                expect(arg).toBe('/a');
                return 'data:image/png;base64,AAAA';
            });
            const entry = new DirectoryEntry(new EntryPath('/a'));
            const entryIconService = new EntryIconServiceImpl();
            const promise = entryIconService.getDirectoryEntryIconUrl(entry, { signal });
            closeController.close();
            await expect(promise).rejects.toBeInstanceOf(Closed);
        });
    });

    describe('entryIconService.getEntryIconUrl() method', () => {
        test('it returns the icon URL of the directory entry', async () => {
            const invoke = jest.spyOn(ipcRenderer, 'invoke');
            invoke.mockImplementation(async (channel, arg) => {
                expect(channel).toBe('icon.getDirectoryIconDataUrl');
                expect(arg).toBe('/a');
                return 'data:image/png;base64,AAAA';
            });
            const entry = new DirectoryEntry(new EntryPath('/a'));
            const entryIconService = new EntryIconServiceImpl();
            const result = await entryIconService.getEntryIconUrl(entry);
            expect(result).toBe('data:image/png;base64,AAAA');
        });

        test('it returns the icon URL of the file entry', async () => {
            const invoke = jest.spyOn(ipcRenderer, 'invoke');
            invoke.mockImplementation(async (channel, arg) => {
                expect(channel).toBe('icon.getFileIconDataUrl');
                expect(arg).toBe('/a/b');
                return 'data:image/png;base64,BBBB';
            });
            const entry = new FileEntry(new EntryPath('/a/b'));
            const entryIconService = new EntryIconServiceImpl();
            const result = await entryIconService.getEntryIconUrl(entry);
            expect(result).toBe('data:image/png;base64,BBBB');
        });

        test('it throws if the passed signal is closed', async () => {
            const closeController = new CloseController();
            closeController.close();
            const { signal } = closeController;
            const invoke = jest.spyOn(ipcRenderer, 'invoke');
            invoke.mockImplementation(async (channel, arg) => {
                return 'data:image/png;base64,CCCC';
            });
            const entry1 = new DirectoryEntry(new EntryPath('/a'));
            const entry2 = new FileEntry(new EntryPath('/a/b'));
            const entryIconService = new EntryIconServiceImpl();
            const promise1 = entryIconService.getEntryIconUrl(entry1, { signal });
            await expect(promise1).rejects.toBeInstanceOf(Closed);
            const promise2 = entryIconService.getEntryIconUrl(entry2, { signal });
            await expect(promise2).rejects.toBeInstanceOf(Closed);
        });

        test('it throws if the passed signal is closed even after called', async () => {
            const closeController1 = new CloseController();
            const signal1 = closeController1.signal;
            const closeController2 = new CloseController();
            const signal2 = closeController2.signal;
            const invoke = jest.spyOn(ipcRenderer, 'invoke');
            invoke.mockImplementation(async (channel, arg) => {
                return 'data:image/png;base64,CCCC';
            });
            const entry1 = new DirectoryEntry(new EntryPath('/a'));
            const entry2 = new FileEntry(new EntryPath('/a/b'));
            const entryIconService = new EntryIconServiceImpl();
            const promise1 = entryIconService.getEntryIconUrl(entry1, { signal: signal1 });
            closeController1.close();
            await expect(promise1).rejects.toBeInstanceOf(Closed);
            const promise2 = entryIconService.getEntryIconUrl(entry2, { signal: signal2 });
            closeController2.close();
            await expect(promise2).rejects.toBeInstanceOf(Closed);
        });
    });

    describe('entryIconService.getFileEntryIconUrl() method', () => {
        test('it returns the icon URL of the file entry', async () => {
            const invoke = jest.spyOn(ipcRenderer, 'invoke');
            invoke.mockImplementation(async (channel, arg) => {
                expect(channel).toBe('icon.getFileIconDataUrl');
                expect(arg).toBe('/a/b');
                return 'data:image/png;base64,BBBB';
            });
            const entry = new FileEntry(new EntryPath('/a/b'));
            const entryIconService = new EntryIconServiceImpl();
            const result = await entryIconService.getFileEntryIconUrl(entry);
            expect(result).toBe('data:image/png;base64,BBBB');
        });

        test('it throws if the passed signal is closed', async () => {
            const closeController = new CloseController();
            closeController.close();
            const { signal } = closeController;
            const invoke = jest.spyOn(ipcRenderer, 'invoke');
            invoke.mockImplementation(async (channel, arg) => {
                expect(channel).toBe('icon.getFileIconDataUrl');
                expect(arg).toBe('/a/b');
                return 'data:image/png;base64,BBBB';
            });
            const entry = new FileEntry(new EntryPath('/a/b'));
            const entryIconService = new EntryIconServiceImpl();
            const promise = entryIconService.getFileEntryIconUrl(entry, { signal });
            await expect(promise).rejects.toBeInstanceOf(Closed);
        });

        test('it throws if the passed signal is closed even after called', async () => {
            const closeController = new CloseController();
            const { signal } = closeController;
            const invoke = jest.spyOn(ipcRenderer, 'invoke');
            invoke.mockImplementation(async (channel, arg) => {
                expect(channel).toBe('icon.getFileIconDataUrl');
                expect(arg).toBe('/a/b');
                return 'data:image/png;base64,BBBB';
            });
            const entry = new FileEntry(new EntryPath('/a/b'));
            const entryIconService = new EntryIconServiceImpl();
            const promise = entryIconService.getFileEntryIconUrl(entry, { signal });
            closeController.close();
            await expect(promise).rejects.toBeInstanceOf(Closed);
        });
    });
});

