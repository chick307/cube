import DirectoryEntry from '../entities/directory-entry';
import Entry from '../entities/entry';
import FileEntry from '../entities/file-entry';

export type FileSystem = {
    readDirectory(directoryEntry: DirectoryEntry): Promise<Entry[]>;

    readFile(fileEntry: FileEntry): Promise<Buffer>;
};
