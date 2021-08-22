import { EntryName } from '../values/entry-name';
import { EntryPath } from '../values/entry-path';

export class Entry {
    readonly name: EntryName;

    readonly path: EntryPath;

    constructor(entryPath: EntryPath) {
        this.name = entryPath.name;
        this.path = entryPath;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any): Entry {
        throw Error();
    }

    equals(otherEntry: Entry): boolean {
        return this.path.equals(otherEntry.path);
    }

    toJson() {
        return {
            path: this.path.toString(),
        };
    }
}
