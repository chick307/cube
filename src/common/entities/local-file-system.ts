import { FileSystem } from './file-system';

export class LocalFileSystem extends FileSystem {
    readonly type = 'local';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any) {
        if (json === null || typeof json !== 'object')
            throw Error();
        if (json.type !== 'local')
            throw Error();
        return new LocalFileSystem();
    }

    isLocal(): this is LocalFileSystem {
        return true;
    }

    toJson() {
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
}

FileSystem.prototype.isLocal = () => false;

const fromJson = FileSystem.fromJson;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
FileSystem.fromJson = (json: any) => {
    if (json?.type === 'local')
        return LocalFileSystem.fromJson(json);
    return fromJson(json);
};
