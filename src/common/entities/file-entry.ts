import { Entry } from './entry';

export class FileEntry extends Entry {
    readonly type = 'file';

    isFile(): this is FileEntry {
        return true;
    }

    toJson() {
        return {
            ...super.toJson(),
            type: 'file',
        };
    }
}

declare module './entry' {
    interface Entry {
        isFile(): this is FileEntry;
    }
}

Entry.prototype.isFile = () => false;
