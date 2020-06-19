import { promises as fs } from 'fs';
import { remote } from 'electron';

import DirectoryEntry from '../entities/directory-entry';
import Entry from '../entities/entry';
import FileEntry from '../entities/file-entry';
import EntryName from '../values/entry-name';
import EntryPath from '../values/entry-path';
import { FileSystem } from './file-system';

const HOME_DIRECTORY_PATH = new EntryPath(remote.app.getPath('home'));

export class LocalFileSystemService implements FileSystem {
    getHomeDirectory(): DirectoryEntry {
        return new DirectoryEntry(HOME_DIRECTORY_PATH);
    }

    async readDirectory(directoryEntry: DirectoryEntry): Promise<Entry[]> {
        const names = await fs.readdir(directoryEntry.path.toString());
        const entries: Entry[] = [];
        for (const name of names) {
            const entryName = new EntryName(name);
            const entryPath = directoryEntry.path.join(entryName);
            const stat = await fs.stat(entryPath.toString());
            if (stat.isFile()) {
                entries.push(new FileEntry(entryPath));
            } else if (stat.isDirectory()) {
                entries.push(new DirectoryEntry(entryPath));
            } else {
                entries.push(new Entry(entryPath));
            }
        }
        return entries;
    }

    async readFile(fileEntry: FileEntry): Promise<Buffer> {
        const buffer = await fs.readFile(fileEntry.path.toString());
        return buffer;
    }
}

export default LocalFileSystemService;
