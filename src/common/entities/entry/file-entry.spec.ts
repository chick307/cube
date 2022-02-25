import { EntryPath } from '../../values/entry-path';
import { DummyEntry } from './entry.test-helper';
import { FileEntry } from './file-entry';

describe('FileEntry class', () => {
    describe('FileEntry.fromJson() method', () => {
        test('it returns FileEntry instance', () => {
            const entry = FileEntry.fromJson({ type: 'file', path: '/a/b/c' });
            expect(entry).toEqual(new FileEntry(new EntryPath('/a/b/c')));
        });

        test('it throws an error if invalid value is passed', () => {
            expect(() => FileEntry.fromJson(null)).toThrow();
            expect(() => FileEntry.fromJson(undefined)).toThrow();
            expect(() => FileEntry.fromJson({ type: '' })).toThrow();
            expect(() => FileEntry.fromJson({ type: 'symbolic-link' })).toThrow();
            expect(() => FileEntry.fromJson({ type: 'file' })).toThrow();
            expect(() => FileEntry.fromJson({ type: 'file', path: 1 })).toThrow();
        });
    });

    describe('fileEntry.equals() method', () => {
        test('it returns if the passed entry equals self', () => {
            const fileEntryA = new FileEntry(new EntryPath('/a'));
            const fileEntryB = new FileEntry(new EntryPath('/a/b'));
            const entryA = new DummyEntry(new EntryPath('/a'));
            const entryB = new DummyEntry(new EntryPath('/a/b'));
            expect(fileEntryA.equals(fileEntryA)).toBe(true);
            expect(fileEntryA.equals(new FileEntry(new EntryPath('/a')))).toBe(true);
            expect(fileEntryB.equals(fileEntryB)).toBe(true);
            expect(fileEntryB.equals(new FileEntry(new EntryPath('/a/b')))).toBe(true);
            expect(fileEntryA.equals(entryA)).toBe(false);
            expect(fileEntryA.equals(entryB)).toBe(false);
            expect(fileEntryA.equals(fileEntryB)).toBe(false);
            expect(fileEntryB.equals(entryA)).toBe(false);
            expect(fileEntryB.equals(entryB)).toBe(false);
            expect(fileEntryB.equals(fileEntryA)).toBe(false);
            expect(fileEntryA.equals(null)).toBe(false);
            expect(fileEntryA.equals(undefined)).toBe(false);
            expect(fileEntryB.equals(null)).toBe(false);
            expect(fileEntryB.equals(undefined)).toBe(false);
        });
    });

    describe('fileEntry.isFile() method', () => {
        test('it returns true', async () => {
            const fileEntry = new FileEntry(new EntryPath('/a/b'));
            expect(fileEntry.isFile()).toBe(true);
        });
    });

    describe('fileEntry.toJson() method', () => {
        test('it return JSON object', () => {
            const fileEntry = new FileEntry(new EntryPath('/a/b'));
            expect(fileEntry.toJson()).toEqual({ type: 'file', path: '/a/b' });
        });
    });
});

describe('entry.isFile() method', () => {
    test('it returns false', async () => {
        const entry = new DummyEntry(new EntryPath('/a/e'));
        expect(entry.isFile()).toBe(false);
    });
});
