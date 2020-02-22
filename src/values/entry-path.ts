import * as path from 'path';

import EntryName from './entry-name';

export class EntryPath {
    private value: string;

    readonly name: EntryName;

    constructor(value: string) {
        this.value = value;
        this.name = new EntryName(path.basename(value));
    }

    join(entryName: EntryName): EntryPath {
        return new EntryPath(path.join(this.value, entryName.toString()));
    }

    toString(): string {
        return this.value;
    }
}

export default EntryPath;
