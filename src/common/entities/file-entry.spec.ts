import { EntryPath } from '../values/entry-path';
import { Entry } from './entry';
import { FileEntry } from './file-entry';

describe('FileEntey class', () => {
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
        const entry = new Entry(new EntryPath('/a/e'));
        expect(entry.isFile()).toBe(false);
    });
});
