import { MediaViewerState } from '.';

describe('MediaViewerState class', () => {
    describe('MediaViewerState.fromJson() method', () => {
        test('it returns an instance of MediaViewerState class', () => {
            expect(MediaViewerState.fromJson({ type: 'media' })).toEqual(new MediaViewerState());
        });

        test('it throws an error if the passed JSON is invalid', () => {
            expect(() => MediaViewerState.fromJson(null)).toThrow();
            expect(() => MediaViewerState.fromJson({})).toThrow();
            expect(() => MediaViewerState.fromJson({ type: '' })).toThrow();
            expect(() => MediaViewerState.fromJson({ type: 'binary' })).toThrow();
        });
    });

    describe('mediaViewerState.toJson() method', () => {
        test('it returns JSON object', () => {
            expect(new MediaViewerState().toJson()).toEqual({ type: 'media' });
        });
    });
});
