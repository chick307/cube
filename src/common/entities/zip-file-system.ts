import { FileEntry } from './file-entry';
import { FileSystem } from './file-system';

export type Container = {
    readonly entry: FileEntry;
    readonly fileSystem: FileSystem;
};

export type ConstructorParameters = {
    container: Container;
};

export class ZipFileSystem extends FileSystem {
    readonly container: Container;
    readonly type = 'zip';

    constructor(params: ConstructorParameters) {
        super();
        this.container = {
            entry: params.container.entry,
            fileSystem: params.container.fileSystem,
        };
    }

    isZip(): this is ZipFileSystem {
        return true;
    }
}

declare module './file-system' {
    interface FileSystem {
        isZip(): this is ZipFileSystem;
    }
}

FileSystem.prototype.isZip = () => false;
