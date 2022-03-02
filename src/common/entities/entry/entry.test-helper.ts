import { EntryPath } from '../../values/entry-path';
import { DirectoryEntry } from './directory-entry';
import { Entry, EntryJsonBase } from './entry';
import { FileEntry } from './file-entry';

export type DummyEntryJson = EntryJsonBase & {
    type: 'dummy';
};

export class DummyEntry extends Entry {
    readonly type = 'dummy';
}

export const createEntryMap = (paths: string[]): Map<string, Entry> => {
    const entries = new Map<string, Entry>();
    entries.set('/', new DirectoryEntry(new EntryPath('/')));
    for (const path of paths) {
        if (path.endsWith('/')) {
            const pathString = path.slice(0, -1) || '/';
            entries.set(pathString, new DirectoryEntry(new EntryPath(pathString)));
        } else {
            let parentPath = path;
            while ((parentPath = parentPath.replace(/\/[^/]+?$/, '')) !== '') {
                const parentEntry = entries.get(parentPath);
                if (parentEntry != null) {
                    if (parentEntry.isDirectory())
                        break;
                    throw Error(`Invalid path "${path}"`);
                }
                entries.set(parentPath, new DirectoryEntry(new EntryPath(parentPath)));
            }
            entries.set(path, new FileEntry(new EntryPath(path)));
        }
    }
    return entries;
};

declare module './entry' {
    interface EntryJsonTypes {
        dummyEntry: DummyEntryJson;
    }
}
