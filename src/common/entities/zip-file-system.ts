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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any): ZipFileSystem {
        if (json === null || typeof json !== 'object')
            throw Error();
        if (json.type !== 'zip')
            throw Error();
        if (json.container === null || typeof json.container !== 'object')
            throw Error();
        const fileSystem = new ZipFileSystem({
            container: {
                entry: FileEntry.fromJson(json.container.entry),
                fileSystem: FileSystem.fromJson(json.container.fileSystem),
            },
        });
        return fileSystem;
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

const fromJson = FileSystem.fromJson;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
FileSystem.fromJson = (json: any) => {
    if (json?.type === 'zip')
        return ZipFileSystem.fromJson(json);
    return fromJson(json);
};
