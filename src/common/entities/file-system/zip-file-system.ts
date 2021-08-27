import { FileEntry, FileEntryJson } from '../entry';
import { FileSystem, FileSystemJson, FileSystemJsonBase } from './file-system';

export type ZipContainer = {
    readonly entry: FileEntry;
    readonly fileSystem: FileSystem;
};

export type ConstructorParameters = {
    container: ZipContainer;
};

export type ZipFileSystemJson = FileSystemJsonBase & {
    type: 'zip';
    container: {
        entry: FileEntryJson;
        fileSystem: FileSystemJson;
    };
};

export class ZipFileSystem extends FileSystem {
    readonly container: ZipContainer;

    readonly type = 'zip';

    constructor(params: ConstructorParameters) {
        super();
        this.container = {
            entry: params.container.entry,
            fileSystem: params.container.fileSystem,
        };
    }

    static fromJson(json: ZipFileSystemJson): ZipFileSystem;

    static fromJson(json: unknown): never;

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

    equals(otherFileSystem: FileSystem): boolean {
        return otherFileSystem instanceof ZipFileSystem &&
            otherFileSystem.type === this.type &&
            otherFileSystem.container.entry.equals(otherFileSystem.container.entry) &&
            otherFileSystem.container.fileSystem.equals(otherFileSystem.container.fileSystem);
    }

    isZip(): this is ZipFileSystem {
        return true;
    }

    toJson(): ZipFileSystemJson {
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

    interface FileSystemJsonTypes {
        zipFileSystem: ZipFileSystemJson;
    }
}

FileSystem.prototype.isZip = () => false;

const fromJson = FileSystem.fromJson;
FileSystem.fromJson = ((json: FileSystemJson | null | undefined) => {
    if (json != null && 'type' in json && json.type === 'zip')
        return ZipFileSystem.fromJson(json);
    return fromJson(json);
}) as typeof fromJson;
