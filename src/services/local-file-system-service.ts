import { promises as fs } from 'fs';
import { ipcRenderer } from 'electron';

import { DirectoryEntry } from '../entities/directory-entry';
import { Entry } from '../entities/entry';
import { FileEntry } from '../entities/file-entry';
import { SymbolicLinkEntry } from '../entities/symbolic-link-entry';
import { EntryName } from '../values/entry-name';
import { EntryPath } from '../values/entry-path';
import { FileSystem } from './file-system';

const HOME_DIRECTORY_PATH = new EntryPath(ipcRenderer.sendSync('path.home'));

export class LocalFileSystemService implements FileSystem {
    async _createEntry(entryPath: EntryPath): Promise<Entry> {
        const stat = await fs.lstat(entryPath.toString());
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

    async readDirectory(directoryEntry: DirectoryEntry): Promise<Entry[]> {
        const names = await fs.readdir(directoryEntry.path.toString());
        const entries: Entry[] = [];
        for (const name of names) {
            const entryName = new EntryName(name);
            const entryPath = directoryEntry.path.join(entryName);
            const entry = await this._createEntry(entryPath);
            entries.push(entry);
        }
        return entries;
    }

    async readFile(fileEntry: FileEntry): Promise<Buffer> {
        const buffer = await fs.readFile(fileEntry.path.toString());
        return buffer;
    }

    async readLink(symbolicLinkEntry: SymbolicLinkEntry): Promise<Entry> {
        const linkString = await fs.readlink(symbolicLinkEntry.path.toString());
        const entryPath = symbolicLinkEntry.path.resolve(new EntryPath('..'), new EntryPath(linkString));
        const entry = await this._createEntry(entryPath);
        return entry;
    }
}
