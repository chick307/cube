import { EntryPath } from '../values/entry-path';
import { DirectoryEntry } from './directory-entry';
import { Entry } from './entry';

describe('DirectoryEntey class', () => {
    describe('directoryEntry.isDirectory() method', () => {
        test('it returns true', async () => {
            const directoryEntry = new DirectoryEntry(new EntryPath('/a/c'));
            expect(directoryEntry.isDirectory()).toBe(true);
        });
    });
});

describe('entry.isDirectory() method', () => {
    test('it returns false', async () => {
        const entry = new Entry(new EntryPath('/a/e'));
        expect(entry.isDirectory()).toBe(false);
    });
});

describe('entry.getParentEntry() method', () => {
    test('it returns the parent directory entry', async () => {
        const entry = new Entry(new EntryPath('/a/e'));
        expect(entry.getParentEntry()).toEqual(new DirectoryEntry(new EntryPath('/a')));
    });

    test('it returns null if the entry is the root', async () => {
        const entry = new Entry(new EntryPath('/'));
        expect(entry.getParentEntry()).toBeNull();
    });
});
