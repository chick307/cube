import { EntryName } from '../values/entry-name';
import { EntryPath } from '../values/entry-path';

export class Entry {
    readonly name: EntryName;
    readonly path: EntryPath;

    constructor(entryPath: EntryPath) {
        this.name = entryPath.name;
        this.path = entryPath;
    }
}
