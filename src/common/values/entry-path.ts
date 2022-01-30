import * as path from 'path';

import { EntryName } from './entry-name';

export class EntryPath {
    private _value: string;

    readonly name: EntryName;

    constructor(value: string) {
        this._value = value;
        this.name = new EntryName(path.basename(value));
    }

    equals(otherEntryPath: EntryPath): boolean {
        return this._value === otherEntryPath._value;
    }

    getExtension(): string {
        return this.name.getExtension();
    }

    getParentPath(): EntryPath | null {
        if (this.isRoot())
            return null;
        return new EntryPath(path.join(this._value, '..'));
    }

    isRoot(): boolean {
        return this._value === '/';
    }

    join(entryName: EntryName): EntryPath {
        return new EntryPath(path.join(this._value, entryName.toString()));
    }

    resolve(...paths: EntryPath[]): EntryPath {
        return new EntryPath(path.resolve(this._value, ...paths.map((p) => p._value)));
    }

    toString(): string {
        return this._value;
    }
}
