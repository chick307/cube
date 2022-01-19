import JSZip from 'jszip';

import { DirectoryEntry, FileEntry } from '../../common/entities/entry';
import type { Entry } from '../../common/entities/entry';
import type { ZipContainer, ZipFileSystem } from '../../common/entities/file-system';
import type { CloseSignal } from '../../common/utils/close-controller';
import { EntryPath } from '../../common/values/entry-path';
import type { EntryService } from './entry-service';

export type ZipEntryService = {
    createEntryFromPath(params: CreateEntryFromPathParams): Promise<Entry | null>;

    readDirectory(params: ReadDirectoryParams): Promise<Entry[]>;

    readFile(params: ReadFileParams): Promise<Buffer>;
};

export type CreateEntryFromPathParams = {
    entryPath: EntryPath;

    entryService: EntryService;

    fileSystem: ZipFileSystem;

    signal?: CloseSignal | null | undefined;
};

export type ReadDirectoryParams = {
    entry: DirectoryEntry;

    entryService: EntryService;

    fileSystem: ZipFileSystem;

    signal?: CloseSignal | null;
};

export type ReadFileParams = {
    entry: FileEntry;

    entryService: EntryService;

    fileSystem: ZipFileSystem;

    signal?: CloseSignal | null;
};

export class ZipEntryServiceImpl implements ZipEntryService {
    private _zipEntries = new WeakMap<ZipContainer, Promise<Map<string, {
        entry: Entry;
        object: JSZip.JSZipObject;
    }>>>();

    constructor() {
        //
    }

    private _getZipEntries(params: {
        container: ZipContainer;
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

    async createEntryFromPath(params: CreateEntryFromPathParams): Promise<Entry | null> {
        const entries = await this._getZipEntries({
            container: params.fileSystem.container,
            entryService: params.entryService,
        }, params.signal);
        for (const { entry } of entries.values()) {
            if (params.entryPath.equals(entry.path))
                return entry;
        }
        return null;
    }

    async readDirectory(params: ReadDirectoryParams): Promise<Entry[]> {
        const entries = await this._getZipEntries({
            container: params.fileSystem.container,
            entryService: params.entryService,
        }, params.signal);
        const directoryEntries: Entry[] = [];
        for (const { entry } of entries.values()) {
            const parentEntry = entry.getParentEntry();
            if (parentEntry !== null && params.entry.path.equals(parentEntry.path))
                directoryEntries.push(entry);
        }
        return directoryEntries;
    }

    async readFile(params: ReadFileParams): Promise<Buffer> {
        const entries = await this._getZipEntries({
            container: params.fileSystem.container,
            entryService: params.entryService,
        }, params.signal);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const { object } = entries.get(params.entry.path.toString())!;
        const bufferPromise = object.async('nodebuffer');
        const buffer = await (params.signal?.wrapPromise(bufferPromise) ?? bufferPromise);
        return buffer;
    }
}
