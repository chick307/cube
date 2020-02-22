import EntryName from '../values/entry-name';
import EntryPath from '../values/entry-path';

export class FileEntry {
    readonly name: EntryName;
    readonly path: EntryPath;
    readonly type = 'file';

    constructor(entryPath: EntryPath) {
        this.name = entryPath.name;
        this.path = entryPath;
    }
}

export default FileEntry;
