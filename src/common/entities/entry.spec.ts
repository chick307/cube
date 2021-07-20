import { EntryPath } from '../values/entry-path';
import { Entry } from './entry';

describe('Entry class', () => {
    describe('entry.toJson() method', () => {
        test('it returns JSON object', () => {
            const entry = new Entry(new EntryPath('/a/b/c'));
            expect(entry.toJson()).toEqual({ path: '/a/b/c' });
        });
    });
});
