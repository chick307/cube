import { DirectoryEntry } from '../../common/entities/directory-entry';
import { Entry } from '../../common/entities/entry';
import { FileEntry } from '../../common/entities/file-entry';
import { SymbolicLinkEntry } from '../../common/entities/symbolic-link-entry';
import { CloseSignal } from '../../common/utils/close-controller';

export type FileSystem = {
    getContainer(): { fileEntry: FileEntry; fileSystem: FileSystem; } | null;

    readDirectory(directoryEntry: DirectoryEntry, signal: CloseSignal): Promise<Entry[]>;

    readFile(fileEntry: FileEntry, signal: CloseSignal): Promise<Buffer>;

    readLink(symbolicLinkEntry: SymbolicLinkEntry, signal: CloseSignal): Promise<Entry>;
};
