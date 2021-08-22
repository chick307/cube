import { EntryPath } from '../values/entry-path';
import { Entry } from './entry';

export class SymbolicLinkEntry extends Entry {
    readonly type = 'symbolic-link';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any): SymbolicLinkEntry {
        if (json === null || typeof json !== 'object')
            throw Error();
        if (json.type !== 'symbolic-link')
            throw Error();
        if (typeof json.path !== 'string')
            throw Error();
        const entryPath = new EntryPath(json.path);
        const entry = new SymbolicLinkEntry(entryPath);
        return entry;
    }

    equals(otherEntry: Entry): boolean {
        return otherEntry instanceof SymbolicLinkEntry && this.type === otherEntry.type && super.equals(otherEntry);
    }

    isSymbolicLink(): this is SymbolicLinkEntry {
        return true;
    }

    toJson() {
        return {
            ...super.toJson(),
            type: 'symbolic-link',
        };
    }
}

declare module './entry' {
    interface Entry {
        isSymbolicLink(): this is SymbolicLinkEntry;
    }
}

Entry.prototype.isSymbolicLink = () => false;

const fromJson = Entry.fromJson;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
Entry.fromJson = (json: any): Entry => {
    if (json?.type === 'symbolic-link')
        return SymbolicLinkEntry.fromJson(json);
    return fromJson(json);
};
