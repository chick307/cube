import { EntryPath } from '../values/entry-path';
import { DirectoryEntry } from './directory-entry';
import { Entry } from './entry';
import { FileEntry } from './file-entry';
import { SymbolicLinkEntry } from './symbolic-link-entry';

describe('Entry class', () => {
    describe('Entry.fromJson() method', () => {
        test('returns FileEntry instance if the type propperty is "file"', () => {
            const json = { type: 'file', path: '/a/b/c' };
            const entry = Entry.fromJson(json);
            expect(entry).toEqual(new FileEntry(new EntryPath('/a/b/c')));
        });

        test('returns DirectoryEntry instance if the type propperty is "directory"', () => {
            const json = { type: 'directory', path: '/a/b/c' };
            const entry = Entry.fromJson(json);
            expect(entry).toEqual(new DirectoryEntry(new EntryPath('/a/b/c')));
        });

        test('returns SymbolicLinkEntry instance if the type propperty is "symbolic-link"', () => {
            const json = { type: 'symbolic-link', path: '/a/b/c' };
            const entry = Entry.fromJson(json);
            expect(entry).toEqual(new SymbolicLinkEntry(new EntryPath('/a/b/c')));
        });

        test('it throws error if invalid value is passed', () => {
            expect(() => Entry.fromJson(null)).toThrow();
            expect(() => Entry.fromJson(undefined)).toThrow();
            expect(() => Entry.fromJson({ type: '', path: '/a/b/c' })).toThrow();
        });
    });

    describe('entry.equals() method', () => {
        test('it returns if the passed entry equals self', () => {
            const entryA = new Entry(new EntryPath('/a'));
            const entryB = new Entry(new EntryPath('/a/b'));
            expect(entryA.equals(entryA)).toBe(true);
            expect(entryA.equals(new Entry(new EntryPath('/a')))).toBe(true);
            expect(entryB.equals(entryB)).toBe(true);
            expect(entryB.equals(new Entry(new EntryPath('/a/b')))).toBe(true);
            expect(entryA.equals(entryB)).toBe(false);
            expect(entryB.equals(entryA)).toBe(false);
        });
    });

    describe('entry.toJson() method', () => {
        test('it returns JSON object', () => {
            const entry = new Entry(new EntryPath('/a/b/c'));
            expect(entry.toJson()).toEqual({ path: '/a/b/c' });
        });
    });
});
