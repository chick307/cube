import { EntryName } from './entry-name';

describe('EntryName class', () => {
    describe('entryName.getExtension() method', () => {
        test('it returns the extension of the entry name', () => {
            expect(new EntryName('a.txt').getExtension()).toBe('.txt');
            expect(new EntryName('image.png').getExtension()).toBe('.png');
            expect(new EntryName('entry-name.spec.ts').getExtension()).toBe('.ts');
        });
    });

    describe('entryName.toString() property', () => {
        test('it returns the string passed when construction', () => {
            expect(new EntryName('a.txt').toString()).toBe('a.txt');
            expect(new EntryName('image.png').toString()).toBe('image.png');
            expect(new EntryName('entry-name.spec.ts').toString()).toBe('entry-name.spec.ts');
        });
    });
});
