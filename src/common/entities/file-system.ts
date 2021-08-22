export class FileSystem {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any): FileSystem {
        throw Error();
    }

    equals(otherFileSystem: FileSystem): boolean {
        return this === otherFileSystem;
    }

    toJson() {
        return {};
    }
}
