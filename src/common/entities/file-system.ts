export class FileSystem {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    static fromJson(_json: any): FileSystem {
        throw Error();
    }

    toJson() {
        return {};
    }
}
