import { EntryName } from '../../values/entry-name';
import { EntryPath } from '../../values/entry-path';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EntryJsonTypes {}

export type EntryJsonBase = {
    path: string;
};

export type EntryJson = EntryJsonTypes[keyof EntryJsonTypes];

export type EntryType = EntryJson['type'];

export abstract class Entry {
    readonly name: EntryName;

    readonly path: EntryPath;

    abstract readonly type: EntryType;

    constructor(entryPath: EntryPath) {
        this.name = entryPath.name;
        this.path = entryPath;
    }

    static fromJson(json: EntryJson): Entry;

    static fromJson(json: unknown): never;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(_json: any): Entry {
        throw Error();
    }

    equals(otherEntry: Entry): boolean {
        return this.path.equals(otherEntry.path);
    }

    toJson(): EntryJson {
        return {
            path: this.path.toString(),
        } as never;
    }
}
