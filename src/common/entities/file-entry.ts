import { EntryPath } from '../values/entry-path';
import { Entry } from './entry';

export class FileEntry extends Entry {
    readonly type = 'file';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any): FileEntry {
        if (json === null || typeof json !== 'object')
            throw Error();
        if (json.type !== 'file')
            throw Error();
        if (typeof json.path !== 'string')
            throw Error();
        const entryPath = new EntryPath(json.path);
        const entry = new FileEntry(entryPath);
        return entry;
    }

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

const fromJson = Entry.fromJson;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
Entry.fromJson = (json: any): Entry => {
    if (json?.type === 'file')
        return FileEntry.fromJson(json);
    return fromJson(json);
};
