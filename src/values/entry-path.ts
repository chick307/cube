import * as path from 'path';

import EntryName from './entry-name';

export class EntryPath {
    private value: string;

    readonly name: EntryName;

    constructor(value: string) {
        this.value = value;
        this.name = new EntryName(path.basename(value));
    }

    equals(otherEntryPath: EntryPath): boolean {
        return this.value === otherEntryPath.value;
    }

    getExtension(): string {
        return this.name.getExtension();
    }

    getParentPath(): EntryPath | null {
        if (this.value === '/')
            return null;
        return new EntryPath(path.join(this.value, '..'));
    }

    join(entryName: EntryName): EntryPath {
        return new EntryPath(path.join(this.value, entryName.toString()));
    }

    toString(): string {
        return this.value;
    }
}

export default EntryPath;
