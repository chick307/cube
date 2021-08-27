export type FileSystemJsonBase = {
    //
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FileSystemJsonTypes {}

export type FileSystemJson = FileSystemJsonTypes[keyof FileSystemJsonTypes];

export class FileSystem {
    static fromJson(json: FileSystemJson): FileSystem;

    static fromJson(json: unknown): FileSystem;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(_json: any): FileSystem {
        throw Error();
    }

    equals(otherFileSystem: FileSystem): boolean {
        return this === otherFileSystem;
    }

    toJson(): FileSystemJson {
        return {} as never;
    }
}
