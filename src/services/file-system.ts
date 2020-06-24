import DirectoryEntry from '../entities/directory-entry';
import Entry from '../entities/entry';
import FileEntry from '../entities/file-entry';
import { SymbolicLinkEntry } from '../entities/symbolic-link-entry';

export type FileSystem = {
    getContainer(): { fileEntry: FileEntry; fileSystem: FileSystem; } | null;

    readDirectory(directoryEntry: DirectoryEntry): Promise<Entry[]>;

    readFile(fileEntry: FileEntry): Promise<Buffer>;

    readLink(symbolicLinkEntry: SymbolicLinkEntry): Promise<Entry>;
};
