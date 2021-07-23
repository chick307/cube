import { promises as fs } from 'fs';

import { DirectoryEntry } from '../../common/entities/directory-entry';
import { Entry } from '../../common/entities/entry';
import { FileEntry } from '../../common/entities/file-entry';
import { LocalFileSystem } from '../../common/entities/local-file-system';
import { SymbolicLinkEntry } from '../../common/entities/symbolic-link-entry';
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
