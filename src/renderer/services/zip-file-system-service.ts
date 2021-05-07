import JSZip from 'jszip';

import { DirectoryEntry } from '../../common/entities/directory-entry';
import { Entry } from '../../common/entities/entry';
import { FileEntry } from '../../common/entities/file-entry';
import { SymbolicLinkEntry } from '../../common/entities/symbolic-link-entry';
import { CloseController, CloseSignal } from '../../common/utils/close-controller';
import { EntryPath } from '../../common/values/entry-path';
import { FileSystem } from './file-system';

export class ZipFileSystemService implements FileSystem {
    private _container: { fileEntry: FileEntry; fileSystem: FileSystem; };
    private _root: DirectoryEntry;
    private _zip: Promise<JSZip>;
    private _zipEntries: Promise<Map<string, { entry: Entry; object: JSZip.JSZipObject; }>> | null = null;

    constructor(params: {
        zipFileEntry: FileEntry;
        zipFileSystem: FileSystem;
    }) {
        const closeController = new CloseController();
        this._container = { fileEntry: params.zipFileEntry, fileSystem: params.zipFileSystem };
        this._zip = params.zipFileSystem.readFile(params.zipFileEntry, closeController.signal)
            .then((buffer) => JSZip.loadAsync(buffer));
        this._root = new DirectoryEntry(new EntryPath('/'));
    }

    private _getZipEntries(signal: CloseSignal): Promise<Map<string, { entry: Entry; object: JSZip.JSZipObject; }>> {
        if (this._zipEntries === null) {
            this._zipEntries = (async () => {
                const zip = await this._zip;
                const map = new Map<string, { entry: Entry; object: JSZip.JSZipObject; }>();
                for (const object of Object.values(zip.files)) {
                    // Convert a, b/, c/d, e/f/ to /a, /b, /c/d, /e/f
                    const entryPath = new EntryPath('/' + object.name.replace(/\/$/, ''));
                    const entry = object.dir ? new DirectoryEntry(entryPath) :
                        new FileEntry(entryPath);
                    map.set(entryPath.toString(), { entry, object });
                }
                return map;
            })();
        }
        return this._zipEntries;
    }

    getContainer() {
        return this._container;
    }

    getRoot(): DirectoryEntry {
        return this._root;
    }

    async readDirectory(directoryEntry: DirectoryEntry, signal: CloseSignal): Promise<Entry[]> {
        const entries = await this._getZipEntries(signal);
        const directoryEntries: Entry[] = [];
        for (const { entry } of entries.values()) {
            const parentEntry = entry.getParentEntry();
            if (parentEntry !== null && directoryEntry.path.equals(parentEntry.path))
                directoryEntries.push(entry);
        }
        return directoryEntries;
    }

    async readFile(fileEntry: FileEntry, signal: CloseSignal): Promise<Buffer> {
        const entries = await this._getZipEntries(signal);
        const { object } = entries.get(fileEntry.path.toString())!;
        const buffer = await signal.wrapPromise(object.async('nodebuffer'));
        return buffer;
    }

    async readLink(_: SymbolicLinkEntry, _signal: CloseSignal): Promise<Entry> {
        throw Error('Not implemented error');
    }
}
