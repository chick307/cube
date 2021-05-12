import { ipcRenderer } from 'electron';

import { DirectoryEntry } from '../../common/entities/directory-entry';
import { Entry } from '../../common/entities/entry';
import { CloseSignal } from '../../common/utils/close-controller';

export type GetDirectoryEntryIconUrlOptions = {
    signal?: CloseSignal | null;
};

export type GetEntryIconUrlOptions = {
    signal?: CloseSignal | null;
};

export type GetFileEntryIconUrlOptions = {
    signal?: CloseSignal | null;
};

export type EntryIconService = {
    getDirectoryEntryIconUrl(entry: DirectoryEntry, options?: GetDirectoryEntryIconUrlOptions | null): Promise<string>;
    getEntryIconUrl(entry: Entry, options?: GetEntryIconUrlOptions | null): Promise<string>;
    getFileEntryIconUrl(entry: Entry, options?: GetFileEntryIconUrlOptions | null): Promise<string>;
};

export class EntryIconServiceImpl implements EntryIconService {
    async getDirectoryEntryIconUrl(
        entry: DirectoryEntry,
        options?: GetDirectoryEntryIconUrlOptions | null,
    ): Promise<string> {
        options?.signal?.throwIfClosed();
        const promise = ipcRenderer.invoke('icon.getDirectoryIconDataUrl', entry.path.toString());
        const url = await (options?.signal?.wrapPromise(promise) ?? promise);
        return url;
    }

    async getEntryIconUrl(
        entry: Entry,
        options?: GetEntryIconUrlOptions | null,
    ): Promise<string> {
        options?.signal?.throwIfClosed();
        if (entry.isDirectory())
            return this.getDirectoryEntryIconUrl(entry, { signal: options?.signal });
        return this.getFileEntryIconUrl(entry, { signal: options?.signal });
    }

    async getFileEntryIconUrl(
        entry: Entry,
        options?: GetFileEntryIconUrlOptions | null,
    ): Promise<string> {
        options?.signal?.throwIfClosed();
        const promise = ipcRenderer.invoke('icon.getFileIconDataUrl', entry.path.toString());
        const url = await (options?.signal?.wrapPromise(promise) ?? promise);
        return url;
    }
}
