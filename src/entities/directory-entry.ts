import Entry from './entry';

export class DirectoryEntry extends Entry {
    readonly type = 'directory';

    isDirectory(): this is DirectoryEntry {
        return true;
    }
}

declare module './entry' {
    interface Entry {
        isDirectory(): this is DirectoryEntry;
    }
}

Entry.prototype.isDirectory = () => false;

export default DirectoryEntry;
