import EntryName from '../values/entry-name';
import EntryPath from '../values/entry-path';

export class DirectoryEntry {
    readonly name: EntryName;
    readonly path: EntryPath;
    readonly type = 'directory';

    constructor(entryPath: EntryPath) {
        this.name = entryPath.name;
        this.path = entryPath;
    }
}

export default DirectoryEntry;
