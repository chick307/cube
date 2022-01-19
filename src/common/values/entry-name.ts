import * as path from 'path';

export class EntryName {
    private _value: string;

    constructor(value: string) {
        this._value = value;
    }

    getExtension(): string {
        return path.extname(this._value);
    }

    startsWithDot(): boolean {
        return this._value.startsWith('.');
    }

    toString(): string {
        return this._value;
    }
}
