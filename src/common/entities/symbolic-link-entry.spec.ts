import { EntryPath } from '../values/entry-path';
import { Entry } from './entry';
import { SymbolicLinkEntry } from './symbolic-link-entry';

describe('SymbolicLinkEntey class', () => {
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
