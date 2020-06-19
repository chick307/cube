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

        getParentEntry(): DirectoryEntry | null;
    }
}

Entry.prototype.getParentEntry = function getParentEntry(this: Entry): DirectoryEntry | null {
    const parentPath = this.path.getParentPath();
    if (parentPath === null)
        return null;
    const parentEntry = new DirectoryEntry(parentPath);
    return parentEntry;
};

Entry.prototype.isDirectory = () => false;

export default DirectoryEntry;
