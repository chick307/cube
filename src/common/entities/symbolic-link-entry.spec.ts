import { EntryPath } from '../values/entry-path';
import { Entry } from './entry';
import { SymbolicLinkEntry } from './symbolic-link-entry';

describe('SymbolicLinkEntry class', () => {
    describe('SymbolicLinkEntry.fromJson() method', () => {
        test('it returns SymbolicLinkEntry instance', () => {
            const entry = SymbolicLinkEntry.fromJson({ type: 'symbolic-link', path: '/a/b/c' });
            expect(entry).toEqual(new SymbolicLinkEntry(new EntryPath('/a/b/c')));
        });

        test('it throws an error if invalid value is passed', () => {
            expect(() => SymbolicLinkEntry.fromJson(null)).toThrow();
            expect(() => SymbolicLinkEntry.fromJson(undefined)).toThrow();
            expect(() => SymbolicLinkEntry.fromJson({ type: '' })).toThrow();
            expect(() => SymbolicLinkEntry.fromJson({ type: 'directory' })).toThrow();
            expect(() => SymbolicLinkEntry.fromJson({ type: 'symbolic-link' })).toThrow();
            expect(() => SymbolicLinkEntry.fromJson({ type: 'symbolic-link', path: 1 })).toThrow();
        });
    });

    describe('symbolicLinkEntry.isSymbolicLink() method', () => {
        test('it returns true', async () => {
            const symbolicLinkEntry = new SymbolicLinkEntry(new EntryPath('/a/c'));
            expect(symbolicLinkEntry.isSymbolicLink()).toBe(true);
        });
    });

    describe('symbolicLinkEntry.toJson() method', () => {
        test('it return JSON object', () => {
            const symbolicLinkEntry = new SymbolicLinkEntry(new EntryPath('/a/b'));
            expect(symbolicLinkEntry.toJson()).toEqual({ type: 'symbolic-link', path: '/a/b' });
        });
    });
});

describe('entry.isSymbolicLink() method', () => {
    test('it returns false', async () => {
        const entry = new Entry(new EntryPath('/a/e'));
        expect(entry.isSymbolicLink()).toBe(false);
    });
});
