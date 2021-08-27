import { promises as fs } from 'fs';

import { DirectoryEntry, Entry, FileEntry, SymbolicLinkEntry } from '../../common/entities/entry';
import { LocalFileSystem } from '../../common/entities/file-system';
import { EntryPath } from '../../common/values/entry-path';

export type LocalFileSystemService = {
    getEntryFromPath(pathString: string): Promise<Entry>;

    getFileSystem(): LocalFileSystem;
};

export class LocalFileSystemServiceImpl implements LocalFileSystemService {
    async getEntryFromPath(pathString: string): Promise<Entry> {
        const entryPath = new EntryPath(pathString);
        const stat = await fs.lstat(pathString);
        const entry =
            stat.isSymbolicLink() ? new SymbolicLinkEntry(entryPath) :
            stat.isDirectory() ? new DirectoryEntry(entryPath) :
            stat.isFile() ? new FileEntry(entryPath) :
            new Entry(entryPath);
        return entry;
    }

    getFileSystem(): LocalFileSystem {
        return new LocalFileSystem();
    }
}
