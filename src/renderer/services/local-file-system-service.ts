import { promises as fs } from 'fs';
import { ipcRenderer } from 'electron';

import { DirectoryEntry } from '../../common/entities/directory-entry';
import { Entry } from '../../common/entities/entry';
import { FileEntry } from '../../common/entities/file-entry';
import { SymbolicLinkEntry } from '../../common/entities/symbolic-link-entry';
import { CloseSignal } from '../../common/utils/close-controller';
import { EntryName } from '../../common/values/entry-name';
import { EntryPath } from '../../common/values/entry-path';
import { FileSystem } from './file-system';

const HOME_DIRECTORY_PATH = new EntryPath(ipcRenderer.sendSync('path.home'));

export class LocalFileSystemService implements FileSystem {
    async _createEntry(entryPath: EntryPath, signal: CloseSignal): Promise<Entry> {
        const stat = await signal.wrapPromise(fs.lstat(entryPath.toString()));
        if (stat.isFile()) {
            return new FileEntry(entryPath);
        } else if (stat.isDirectory()) {
            return new DirectoryEntry(entryPath);
        } else if (stat.isSymbolicLink()) {
            return new SymbolicLinkEntry(entryPath);
        } else {
            return new Entry(entryPath);
        }
    }

    getContainer(): null {
        return null;
    }

    getHomeDirectory(): DirectoryEntry {
        return new DirectoryEntry(HOME_DIRECTORY_PATH);
    }

    async readDirectory(directoryEntry: DirectoryEntry, signal: CloseSignal): Promise<Entry[]> {
        const names = await signal.wrapPromise(fs.readdir(directoryEntry.path.toString()));
        const entries: Entry[] = [];
        for (const name of names) {
            const entryName = new EntryName(name);
            const entryPath = directoryEntry.path.join(entryName);
            const entry = await this._createEntry(entryPath, signal);
            entries.push(entry);
        }
        return entries;
    }

    async readFile(fileEntry: FileEntry, signal: CloseSignal): Promise<Buffer> {
        const buffer = await signal.wrapPromise(fs.readFile(fileEntry.path.toString()));
        return buffer;
    }

    async readLink(symbolicLinkEntry: SymbolicLinkEntry, signal: CloseSignal): Promise<Entry> {
        const linkString = await signal.wrapPromise(fs.readlink(symbolicLinkEntry.path.toString()));
        const entryPath = symbolicLinkEntry.path.resolve(new EntryPath('..'), new EntryPath(linkString));
        const entry = await this._createEntry(entryPath, signal);
        return entry;
    }
}
