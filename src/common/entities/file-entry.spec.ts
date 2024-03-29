import { EntryPath } from '../values/entry-path';
import { Entry } from './entry';
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
