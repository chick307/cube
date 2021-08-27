import { EntryPath } from '../../values/entry-path';
import { Entry, EntryJson, EntryJsonBase } from './entry';

export type SymbolicLinkEntryJson = EntryJsonBase & {
    type: 'symbolic-link';
};

export class SymbolicLinkEntry extends Entry {
    readonly type = 'symbolic-link';

    static fromJson(json: SymbolicLinkEntryJson): SymbolicLinkEntry;

    static fromJson(json: unknown): never;

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

    toJson(): SymbolicLinkEntryJson {
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

    interface EntryJsonTypes {
        symbolicLinkEntry: SymbolicLinkEntryJson;
    }
}

Entry.prototype.isSymbolicLink = () => false;

const fromJson = Entry.fromJson;
Entry.fromJson = ((json: EntryJson | null | undefined): Entry => {
    if (json != null && 'type' in json && json.type === 'symbolic-link')
        return SymbolicLinkEntry.fromJson(json);
    return fromJson(json);
}) as typeof fromJson;
