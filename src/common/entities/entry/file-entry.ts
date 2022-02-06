import { EntryPath } from '../../values/entry-path';
import { Entry, EntryJson, EntryJsonBase } from './entry';

export type FileEntryJson = EntryJsonBase & {
    type: 'file';
};

export class FileEntry extends Entry {
    readonly type = 'file';

    static fromJson(json: FileEntryJson): FileEntry;

    static fromJson(json: unknown): never;

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

    equals(otherEntry: Entry | null | undefined): boolean {
        return otherEntry instanceof FileEntry && this.type === otherEntry.type && super.equals(otherEntry);
    }

    isFile(): this is FileEntry {
        return true;
    }

    toJson(): FileEntryJson {
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

    interface EntryJsonTypes {
        fileEntry: FileEntryJson;
    }
}

Entry.prototype.isFile = () => false;

const fromJson = Entry.fromJson;
Entry.fromJson = ((json: EntryJson | null | undefined): Entry => {
    if (json != null && 'type' in json && json.type === 'file')
        return FileEntry.fromJson(json);
    return fromJson(json);
}) as typeof fromJson;
