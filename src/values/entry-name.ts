export class EntryName {
    private value: string;

    constructor(value: string) {
        this.value = value;
    }

    toString(): string {
        return this.value;
    }
}

export default EntryName;
