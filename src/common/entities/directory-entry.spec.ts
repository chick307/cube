import { EntryPath } from '../values/entry-path';
import { DirectoryEntry } from './directory-entry';
import { Entry } from './entry';

describe('DirectoryEntry class', () => {
    describe('DirectoryEntry.fromJson() method', () => {
        test('it returns DirectoryEntry instance', () => {
            const entry = DirectoryEntry.fromJson({ type: 'directory', path: '/a/b/c' });
            expect(entry).toEqual(new DirectoryEntry(new EntryPath('/a/b/c')));
        });

        test('it throws an error if invalid value is passed', () => {
            expect(() => DirectoryEntry.fromJson(null)).toThrow();
            expect(() => DirectoryEntry.fromJson(undefined)).toThrow();
            expect(() => DirectoryEntry.fromJson({ type: '' })).toThrow();
            expect(() => DirectoryEntry.fromJson({ type: 'file' })).toThrow();
            expect(() => DirectoryEntry.fromJson({ type: 'directory' })).toThrow();
            expect(() => DirectoryEntry.fromJson({ type: 'directory', path: 1 })).toThrow();
        });
    });

    describe('directoryEntry.isDirectory() method', () => {
        test('it returns true', async () => {
            const directoryEntry = new DirectoryEntry(new EntryPath('/a/c'));
            expect(directoryEntry.isDirectory()).toBe(true);
        });
    });

    describe('directoryEntry.toJson() method', () => {
        test('it return JSON object', () => {
            const directoryEntry = new DirectoryEntry(new EntryPath('/a/b'));
            expect(directoryEntry.toJson()).toEqual({ type: 'directory', path: '/a/b' });
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
