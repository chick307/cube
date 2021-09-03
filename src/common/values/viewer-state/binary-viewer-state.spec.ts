import { BinaryViewerState } from '.';

describe('BinaryViewerState class', () => {
    describe('BinaryViewerState.fromJson() method', () => {
        test('it returns an instance of BinaryViewerState class', () => {
            expect(BinaryViewerState.fromJson({ type: 'binary' })).toEqual(new BinaryViewerState());
        });

        test('it throws an error if the passed JSON is invalid', () => {
            expect(() => BinaryViewerState.fromJson(null)).toThrow();
            expect(() => BinaryViewerState.fromJson({})).toThrow();
            expect(() => BinaryViewerState.fromJson({ type: '' })).toThrow();
            expect(() => BinaryViewerState.fromJson({ type: 'text' })).toThrow();
        });
    });

    describe('binaryViewerState.toJson() method', () => {
        test('it returns JSON object', () => {
            expect(new BinaryViewerState().toJson()).toEqual({ type: 'binary' });
        });
    });
});
