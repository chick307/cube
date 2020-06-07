import * as fs from 'fs';
import { remote } from 'electron';

import DirectoryEntry from '../entities/directory-entry';
import Entry from '../entities/entry';
import FileEntry from '../entities/file-entry';
import EntryName from '../values/entry-name';
import EntryPath from '../values/entry-path';

const HOME_DIRECTORY_PATH = new EntryPath(remote.app.getPath('home'));

export class LocalFileSystemService {
    getHomeDirectory(): DirectoryEntry {
        return new DirectoryEntry(HOME_DIRECTORY_PATH);
    }

    getDirectoryEntries(directoryEntry: DirectoryEntry): Entry[] {
        const entries = fs.readdirSync(directoryEntry.path.toString()).map((name) => {
            const entryName = new EntryName(name);
            const entryPath = directoryEntry.path.join(entryName);
            const stat = fs.statSync(entryPath.toString());
            if (stat.isFile())
                return new FileEntry(entryPath);
            if (stat.isDirectory())
                return new DirectoryEntry(entryPath);
            return new Entry(entryPath);
        });
        return entries;
    }
}

export default LocalFileSystemService;
