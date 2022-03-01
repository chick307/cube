import { CssViewerState } from '../viewer-state';

describe('CssViewerState class', () => {
    describe('CssViewerState.fromJson() method', () => {
        test('it returns an instance of CssViewerState class', () => {
            expect(CssViewerState.fromJson({ type: 'css' })).toEqual(new CssViewerState());
        });

        test('it throws an error if the passed JSON is invalid', () => {
            expect(() => CssViewerState.fromJson(null)).toThrow();
            expect(() => CssViewerState.fromJson({})).toThrow();
            expect(() => CssViewerState.fromJson({ type: '' })).toThrow();
            expect(() => CssViewerState.fromJson({ type: 'binary' })).toThrow();
        });
    });

    describe('cssViewerState.toJson() method', () => {
        test('it returns JSON object', () => {
            expect(new CssViewerState().toJson()).toEqual({ type: 'css' });
        });
    });
});
