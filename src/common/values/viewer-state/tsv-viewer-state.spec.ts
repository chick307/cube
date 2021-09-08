import { TsvViewerState } from '.';

describe('TsvViewerState class', () => {
    describe('TsvViewerState.fromJson() method', () => {
        test('it returns an instance of TsvViewerState class', () => {
            expect(TsvViewerState.fromJson({ type: 'tsv' })).toEqual(new TsvViewerState());
        });

        test('it throws an error if the passed JSON is invalid', () => {
            expect(() => TsvViewerState.fromJson(null)).toThrow();
            expect(() => TsvViewerState.fromJson({})).toThrow();
            expect(() => TsvViewerState.fromJson({ type: '' })).toThrow();
            expect(() => TsvViewerState.fromJson({ type: 'binary' })).toThrow();
        });
    });

    describe('tsvViewerState.toJson() method', () => {
        test('it returns JSON object', () => {
            expect(new TsvViewerState().toJson()).toEqual({ type: 'tsv' });
        });
    });
});
