import { promises as fs } from 'fs';

import { ipcRenderer } from 'electron';

import { DirectoryEntry, Entry, FileEntry, SymbolicLinkEntry } from '../../common/entities/entry';
import { CloseSignal } from '../../common/utils/close-controller';
import { EntryName } from '../../common/values/entry-name';
import { EntryPath } from '../../common/values/entry-path';
import type { Link } from './entry-service';

export type LocalEntryService = {
    createEntryFromPath(params: CreateEntryFromPathParams): Promise<Entry | null>;

    getHomeDirectoryEntry(): DirectoryEntry;

    readDirectory(params: ReadDirectoryParams): Promise<Entry[]>;

    readFile(params: ReadFileParams): Promise<Buffer>;

    readLink(params: ReadLinkParams): Promise<Link>;
};

export type CreateEntryFromPathParams = {
    entryPath: EntryPath;

    signal?: CloseSignal | null | undefined;
};

export type ReadDirectoryParams = {
    entry: DirectoryEntry;

    signal?: CloseSignal | null | undefined;
};

export type ReadFileParams = {
    entry: FileEntry;

    signal?: CloseSignal | null;
};

export type ReadLinkParams = {
    entry: SymbolicLinkEntry;

    signal?: CloseSignal | null;
};

export class LocalEntryServiceImpl implements LocalEntryService {
    async #createEntry(entryPath: EntryPath, signal?: CloseSignal | null): Promise<Entry | null> {
        signal?.throwIfClosed();
        const promise = fs.lstat(entryPath.toString());
        const stat = await (signal?.wrapPromise(promise) ?? promise).catch((e) => {
            if (e.code === 'ENOENT')
                return null;
            throw e;
        });
        if (stat === null)
            return null;
        if (stat.isFile())
            return new FileEntry(entryPath);
        if (stat.isDirectory())
            return new DirectoryEntry(entryPath);
        if (stat.isSymbolicLink())
            return new SymbolicLinkEntry(entryPath);
        throw Error();
    }

    async createEntryFromPath(params: CreateEntryFromPathParams): Promise<Entry | null> {
        const entry = await this.#createEntry(params.entryPath, params.signal);
        return entry;
    }

    getHomeDirectoryEntry(): DirectoryEntry {
        const homeDirectoryPathString = ipcRenderer.sendSync('path.home');
        const homeDirectoryPath = new EntryPath(homeDirectoryPathString);
        return new DirectoryEntry(homeDirectoryPath);
    }

    async readDirectory(params: ReadDirectoryParams): Promise<Entry[]> {
        params.signal?.throwIfClosed();
        const promise = fs.readdir(params.entry.path.toString());
        const names = await (params.signal?.wrapPromise(promise) ?? promise);
        const entries: Entry[] = [];
        for (const name of names) {
            const entryName = new EntryName(name);
            const entryPath = params.entry.path.join(entryName);
            const entry = await this.#createEntry(entryPath, params.signal);
            if (entry === null)
                continue;
            entries.push(entry);
        }
        return entries;
    }

    async readFile(params: ReadFileParams): Promise<Buffer> {
        params.signal?.throwIfClosed();
        const promise = fs.readFile(params.entry.path.toString());
        const buffer = await (params.signal?.wrapPromise(promise) ?? promise);
        return buffer;
    }

    async readLink(params: ReadLinkParams): Promise<Link> {
        params.signal?.throwIfClosed();
        const promise = fs.readlink(params.entry.path.toString());
        const linkString = await (params.signal?.wrapPromise(promise) ?? promise);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const entryPath = params.entry.path.getParentPath()!.resolve(new EntryPath(linkString));
        const entry = await this.#createEntry(entryPath, params.signal)
            .catch(() => null);
        return { entry, linkString };
    }
}
