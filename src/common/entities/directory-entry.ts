import { EntryPath } from '../values/entry-path';
import { Entry } from './entry';

export class DirectoryEntry extends Entry {
    readonly type = 'directory';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any): DirectoryEntry {
        if (json === null || typeof json !== 'object')
            throw Error();
        if (json.type !== 'directory')
            throw Error();
        if (typeof json.path !== 'string')
            throw Error();
        const entryPath = new EntryPath(json.path);
        const entry = new DirectoryEntry(entryPath);
        return entry;
    }

    equals(otherEntry: Entry): boolean {
        return otherEntry instanceof DirectoryEntry && this.type === otherEntry.type && super.equals(otherEntry);
    }

    isDirectory(): this is DirectoryEntry {
        return true;
    }

    toJson() {
        return {
            ...super.toJson(),
            type: 'directory',
        };
    }
}

declare module './entry' {
    interface Entry {
        isDirectory(): this is DirectoryEntry;

        getParentEntry(): DirectoryEntry | null;
    }
}

Entry.prototype.getParentEntry = function getParentEntry(this: Entry): DirectoryEntry | null {
    const parentPath = this.path.getParentPath();
    if (parentPath === null)
        return null;
    const parentEntry = new DirectoryEntry(parentPath);
    return parentEntry;
};

Entry.prototype.isDirectory = () => false;

const fromJson = Entry.fromJson;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
Entry.fromJson = (json: any): Entry => {
    if (json?.type === 'directory')
        return DirectoryEntry.fromJson(json);
    return fromJson(json);
};
