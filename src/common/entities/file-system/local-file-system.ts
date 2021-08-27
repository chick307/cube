import { FileSystem, FileSystemJson, FileSystemJsonBase } from './file-system';

export type LocalFileSystemJson = FileSystemJsonBase & {
    type: 'local';
};

export class LocalFileSystem extends FileSystem {
    readonly type = 'local';

    static fromJson(json: LocalFileSystemJson): LocalFileSystem;

    static fromJson(json: unknown): never;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any) {
        if (json === null || typeof json !== 'object')
            throw Error();
        if (json.type !== 'local')
            throw Error();
        return new LocalFileSystem();
    }

    equals(otherFileSystem: FileSystem): boolean {
        return otherFileSystem instanceof LocalFileSystem && otherFileSystem.type === this.type;
    }

    isLocal(): this is LocalFileSystem {
        return true;
    }

    toJson(): LocalFileSystemJson {
        return {
            ...super.toJson(),
            type: 'local',
        };
    }
}

declare module './file-system' {
    interface FileSystem {
        isLocal(): this is LocalFileSystem;
    }

    interface FileSystemJsonTypes {
        localFileSystem: LocalFileSystemJson;
    }
}

FileSystem.prototype.isLocal = () => false;

const fromJson = FileSystem.fromJson;
FileSystem.fromJson = ((json: FileSystemJson | null | undefined) => {
    if (json != null && 'type' in json && json.type === 'local')
        return LocalFileSystem.fromJson(json);
    return fromJson(json);
}) as typeof fromJson;
