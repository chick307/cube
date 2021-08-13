import JSZip from 'jszip';

import { DirectoryEntry } from '../../common/entities/directory-entry';
import type { Entry } from '../../common/entities/entry';
import { FileEntry } from '../../common/entities/file-entry';
import type { Container, ZipFileSystem } from '../../common/entities/zip-file-system';
import type { CloseSignal } from '../../common/utils/close-controller';
import { EntryPath } from '../../common/values/entry-path';
import type { EntryService } from './entry-service';

export type CreateEntryFromPathParameters = {
    entryPath: EntryPath;
    entryService: EntryService;
    fileSystem: ZipFileSystem;
};

export type CreateEntryFromPathOptions = {
    signal?: CloseSignal | null;
};

export type ReadDirectoryParameters = {
    entry: DirectoryEntry;
    entryService: EntryService;
    fileSystem: ZipFileSystem;
};

export type ReadDirectoryOptions = {
    signal?: CloseSignal | null;
};

export type ReadFileParameters = {
    entry: FileEntry;
    entryService: EntryService;
    fileSystem: ZipFileSystem;
};

export type ReadFileOptions = {
    signal?: CloseSignal | null;
};

export type ZipEntryService = {
    createEntryFromPath(
        params: CreateEntryFromPathParameters,
        options?: CreateEntryFromPathOptions,
    ): Promise<Entry | null>;

    readDirectory(params: ReadDirectoryParameters, options?: ReadDirectoryOptions | null): Promise<Entry[]>;

    readFile(params: ReadFileParameters, options?: ReadFileOptions | null): Promise<Buffer>;
};

export class ZipEntryServiceImpl implements ZipEntryService {
    private _zipEntries = new WeakMap<Container, Promise<Map<string, {
        entry: Entry;
        object: JSZip.JSZipObject;
    }>>>();

    constructor() {
        //
    }

    private _getZipEntries(params: {
        container: Container;
        entryService: EntryService;
    }, signal?: CloseSignal | null): Promise<Map<string, {
            entry: Entry;
            object: JSZip.JSZipObject;
        }>> {
        signal?.throwIfClosed();
        if (this._zipEntries.has(params.container)) {
            if (signal == null) // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                return this._zipEntries.get(params.container)!;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return signal.wrapPromise(this._zipEntries.get(params.container)!);
        }
        const zipEntriesPromise = (async () => {
            const zipBuffer = await params.entryService.readFile(params.container);
            const zip = await JSZip.loadAsync(zipBuffer);
            const map = new Map<string, { entry: Entry; object: JSZip.JSZipObject; }>();
            for (const object of Object.values(zip.files)) {
                // Convert a, b/, c/d, e/f/ to /a, /b, /c/d, /e/f
                const entryPath = new EntryPath(`/${object.name.replace(/\/$/, '')}`);
                const entry = object.dir ? new DirectoryEntry(entryPath) : new FileEntry(entryPath);
                map.set(entryPath.toString(), { entry, object });
            }
            return map;
        })();
        this._zipEntries.set(params.container, zipEntriesPromise);
        if (signal == null)
            return zipEntriesPromise;
        return signal.wrapPromise(zipEntriesPromise);
    }

    async createEntryFromPath(
        params: CreateEntryFromPathParameters,
        options?: CreateEntryFromPathOptions,
    ): Promise<Entry | null> {
        const entries = await this._getZipEntries({
            container: params.fileSystem.container,
            entryService: params.entryService,
        }, options?.signal);
        for (const { entry } of entries.values()) {
            if (params.entryPath.equals(entry.path))
                return entry;
        }
        return null;
    }

    async readDirectory(params: ReadDirectoryParameters, options?: ReadDirectoryOptions | null): Promise<Entry[]> {
        const entries = await this._getZipEntries({
            container: params.fileSystem.container,
            entryService: params.entryService,
        }, options?.signal);
        const directoryEntries: Entry[] = [];
        for (const { entry } of entries.values()) {
            const parentEntry = entry.getParentEntry();
            if (parentEntry !== null && params.entry.path.equals(parentEntry.path))
                directoryEntries.push(entry);
        }
        return directoryEntries;
    }

    async readFile(params: ReadFileParameters, options?: ReadFileOptions | null): Promise<Buffer> {
        const entries = await this._getZipEntries({
            container: params.fileSystem.container,
            entryService: params.entryService,
        }, options?.signal);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const { object } = entries.get(params.entry.path.toString())!;
        const bufferPromise = object.async('nodebuffer');
        const buffer = await (options?.signal?.wrapPromise(bufferPromise) ?? bufferPromise);
        return buffer;
    }
}
