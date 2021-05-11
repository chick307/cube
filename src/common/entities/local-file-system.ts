import { FileSystem } from './file-system';

export class LocalFileSystem extends FileSystem {
    readonly type = 'local';

    isLocal(): this is LocalFileSystem {
        return true;
    }
}

declare module './file-system' {
    interface FileSystem {
        isLocal(): this is LocalFileSystem;
    }
}

FileSystem.prototype.isLocal = () => false;