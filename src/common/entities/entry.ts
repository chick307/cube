import { EntryName } from '../values/entry-name';
import { EntryPath } from '../values/entry-path';

export class Entry {
    readonly name: EntryName;

    readonly path: EntryPath;

    constructor(entryPath: EntryPath) {
        this.name = entryPath.name;
        this.path = entryPath;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    static fromJson(_json: any): Entry {
        throw Error();
    }

    toJson() {
        return {
            path: this.path.toString(),
        };
    }
}
