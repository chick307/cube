import { promises as fs } from 'fs';

import { ipcRenderer } from 'electron';

import { DirectoryEntry } from '../../common/entities/directory-entry';
import { Entry } from '../../common/entities/entry';
import { FileEntry } from '../../common/entities/file-entry';
import { SymbolicLinkEntry } from '../../common/entities/symbolic-link-entry';
import { CloseSignal } from '../../common/utils/close-controller';
import { EntryName } from '../../common/values/entry-name';
import { EntryPath } from '../../common/values/entry-path';
import type { Link } from './entry-service';

export type CreateEntryFromPathParameters = {
    entryPath: EntryPath;
};

export type CreateEntryFromPathOptions = {
    signal?: CloseSignal | null;
};

export type ReadDirectoryParameters = {
    entry: DirectoryEntry;
};

export type ReadDirectoryOptions = {
    signal?: CloseSignal | null;
};

export type ReadFileParameters = {
    entry: FileEntry;
};

export type ReadFileOptions = {
    signal?: CloseSignal | null;
};

export type ReadLinkParameters = {
    entry: SymbolicLinkEntry;
};

export type ReadLinkOptions = {
    signal?: CloseSignal | null;
};

export type LocalEntryService = {
    createEntryFromPath(
        params: CreateEntryFromPathParameters,
        options?: CreateEntryFromPathOptions,
    ): Promise<Entry | null>;

    getHomeDirectoryEntry(): DirectoryEntry;

    readDirectory(params: ReadDirectoryParameters, options?: ReadDirectoryOptions | null): Promise<Entry[]>;

    readFile(params: ReadFileParameters, options?: ReadFileOptions | null): Promise<Buffer>;

    readLink(params: ReadLinkParameters, options?: ReadLinkOptions | null): Promise<Link>;
};

export class LocalEntryServiceImpl implements LocalEntryService {
    private async _createEntry(entryPath: EntryPath, signal?: CloseSignal | null): Promise<Entry | null> {
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
        return new Entry(entryPath);
    }

    async createEntryFromPath(
        params: CreateEntryFromPathParameters,
        options?: CreateEntryFromPathOptions,
    ): Promise<Entry | null> {
        const entry = await this._createEntry(params.entryPath, options?.signal);
        return entry;
    }

    getHomeDirectoryEntry(): DirectoryEntry {
        const homeDirectoryPathString = ipcRenderer.sendSync('path.home');
        const homeDirectoryPath = new EntryPath(homeDirectoryPathString);
        return new DirectoryEntry(homeDirectoryPath);
    }

    async readDirectory(params: ReadDirectoryParameters, options?: ReadDirectoryOptions | null): Promise<Entry[]> {
        options?.signal?.throwIfClosed();
        const promise = fs.readdir(params.entry.path.toString());
        const names = await (options?.signal?.wrapPromise(promise) ?? promise);
        const entries: Entry[] = [];
        for (const name of names) {
            const entryName = new EntryName(name);
            const entryPath = params.entry.path.join(entryName);
            const entry = await this._createEntry(entryPath, options?.signal);
            if (entry === null)
                continue;
            entries.push(entry);
        }
        return entries;
    }

    async readFile(params: ReadFileParameters, options?: ReadFileOptions | null): Promise<Buffer> {
        options?.signal?.throwIfClosed();
        const promise = fs.readFile(params.entry.path.toString());
        const buffer = await (options?.signal?.wrapPromise(promise) ?? promise);
        return buffer;
    }

    async readLink(params: ReadLinkParameters, options?: ReadLinkOptions | null): Promise<Link> {
        options?.signal?.throwIfClosed();
        const promise = fs.readlink(params.entry.path.toString());
        const linkString = await (options?.signal?.wrapPromise(promise) ?? promise);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const entryPath = params.entry.path.getParentPath()!.resolve(new EntryPath(linkString));
        const entry = await this._createEntry(entryPath, options?.signal)
            .catch(() => null);
        return { entry, linkString };
    }
}
