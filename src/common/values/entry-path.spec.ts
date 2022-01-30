import { EntryPath } from './entry-path';

describe('EntryPath class', () => {
    describe('entryPath.equals() method', () => {
        test('it returns true if the argument is the same path', () => {
            const a = new EntryPath('/a/b/c');
            const b = new EntryPath('/a/b/c');
            expect(a.equals(a)).toBe(true);
            expect(a.equals(b)).toBe(true);
            expect(b.equals(a)).toBe(true);
            expect(b.equals(b)).toBe(true);
        });

        test('it returns false if the argument is not the same path', () => {
            const a = new EntryPath('/a/b/c');
            const b = new EntryPath('/a/b/d');
            expect(a.equals(b)).toBe(false);
            expect(b.equals(a)).toBe(false);
        });
    });

    describe('entryPath.getExtension() method', () => {
        test('it returns the extension of the entry path', () => {
            expect(new EntryPath('/a.txt').getExtension()).toBe('.txt');
            expect(new EntryPath('/b/image.png').getExtension()).toBe('.png');
            expect(new EntryPath('/c/def/entry-name.spec.ts').getExtension()).toBe('.ts');
        });
    });

    describe('entryPath.getParentPath() method', () => {
        test('it returns the parent path of the entry path', () => {
            expect(new EntryPath('/a.txt').getParentPath()).toEqual(new EntryPath('/'));
            expect(new EntryPath('/b/image.png').getParentPath()).toEqual(new EntryPath('/b'));
            expect(new EntryPath('/c/def/entry-name.spec.ts').getParentPath())
                .toEqual(new EntryPath('/c/def'));
        });

        test('it returns null if the entry is the root', () => {
            expect(new EntryPath('/').getParentPath()).toBeNull();
        });
    });

    describe('entryPath.isRoot() method', () => {
        test('it returns whether the entry is the root', () => {
            expect(new EntryPath('/').isRoot()).toBe(true);
            expect(new EntryPath('/a').isRoot()).toBe(false);
            expect(new EntryPath('/a/b').isRoot()).toBe(false);
        });
    });

    describe('entryPath.toString() method', () => {
        test('it returns the entry path', () => {
            expect(new EntryPath('/a.txt').toString()).toEqual('/a.txt');
            expect(new EntryPath('/b/image.png').toString()).toEqual('/b/image.png');
            expect(new EntryPath('/c/def/entry-name.spec.ts').toString())
                .toEqual('/c/def/entry-name.spec.ts');
        });
    });
});
