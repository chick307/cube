import FileEntry from '../entities/file-entry';

export type FileSystem = {
    readFile(fileEntry: FileEntry): Promise<Buffer>;
};
