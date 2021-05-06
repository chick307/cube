import * as path from 'path';

export class EntryName {
    private value: string;

    constructor(value: string) {
        this.value = value;
    }

    getExtension(): string {
        return path.extname(this.value);
    }

    toString(): string {
        return this.value;
    }
}
