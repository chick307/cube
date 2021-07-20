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

    toJson() {
        return {
            ...super.toJson(),
            type: 'zip',
            container: {
                entry: this.container.entry.toJson(),
                fileSystem: this.container.fileSystem.toJson(),
            },
        };
    }
}

declare module './file-system' {
    interface FileSystem {
        isZip(): this is ZipFileSystem;
    }
}

FileSystem.prototype.isZip = () => false;
