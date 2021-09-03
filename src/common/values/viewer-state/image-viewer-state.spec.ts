import { ImageViewerState } from '.';

describe('ImageViewerState class', () => {
    describe('ImageViewerState.fromJson() method', () => {
        test('it returns an instance of ImageViewerState class', () => {
            expect(ImageViewerState.fromJson({ type: 'image' })).toEqual(new ImageViewerState());
        });

        test('it throws an error if the passed JSON is invalid', () => {
            expect(() => ImageViewerState.fromJson(null)).toThrow();
            expect(() => ImageViewerState.fromJson({})).toThrow();
            expect(() => ImageViewerState.fromJson({ type: '' })).toThrow();
            expect(() => ImageViewerState.fromJson({ type: 'binary' })).toThrow();
        });
    });

    describe('imageViewerState.toJson() method', () => {
        test('it returns JSON object', () => {
            expect(new ImageViewerState().toJson()).toEqual({ type: 'image' });
        });
    });
});
