import { SymbolicLinkViewerState } from '.';

describe('SymbolicLinkViewerState class', () => {
    describe('SymbolicLinkViewerState.fromJson() method', () => {
        test('it returns an instance of SymbolicLinkViewerState class', () => {
            expect(SymbolicLinkViewerState.fromJson({ type: 'symbolic-link' }))
                .toEqual(new SymbolicLinkViewerState());
        });

        test('it throws an error if the passed JSON is invalid', () => {
            expect(() => SymbolicLinkViewerState.fromJson(null)).toThrow();
            expect(() => SymbolicLinkViewerState.fromJson({})).toThrow();
            expect(() => SymbolicLinkViewerState.fromJson({ type: '' })).toThrow();
            expect(() => SymbolicLinkViewerState.fromJson({ type: 'binary' })).toThrow();
        });
    });

    describe('symbolicLinkViewerState.toJson() method', () => {
        test('it returns JSON object', () => {
            expect(new SymbolicLinkViewerState().toJson()).toEqual({ type: 'symbolic-link' });
        });
    });
});
