import { DirectoryEntry } from '../common/entities/directory-entry';
import { Entry } from '../common/entities/entry';
import { FileEntry } from '../common/entities/file-entry';
import { SymbolicLinkEntry } from '../common/entities/symbolic-link-entry';

export type FileSystem = {
    getContainer(): { fileEntry: FileEntry; fileSystem: FileSystem; } | null;

    readDirectory(directoryEntry: DirectoryEntry): Promise<Entry[]>;

    readFile(fileEntry: FileEntry): Promise<Buffer>;

    readLink(symbolicLinkEntry: SymbolicLinkEntry): Promise<Entry>;
};
