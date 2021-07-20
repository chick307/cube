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

    describe('entry.toJson() method', () => {
        test('it returns JSON object', () => {
            const entry = new Entry(new EntryPath('/a/b/c'));
            expect(entry.toJson()).toEqual({ path: '/a/b/c' });
        });
    });
});
