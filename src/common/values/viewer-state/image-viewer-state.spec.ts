import { Point } from '../point';
import { ImageViewerState } from '../viewer-state';

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

    describe('imageViewerState.setScrollPosition() method', () => {
        test('it creates a new state', () => {
            expect(new ImageViewerState().setScrollPosition(new Point(3, 14)))
                .toEqual(new ImageViewerState({ scrollPosition: new Point(3, 14) }));
            expect(new ImageViewerState({ scrollPosition: new Point(1, 12) }).setScrollPosition(new Point(3, 58)))
                .toEqual(new ImageViewerState({ scrollPosition: new Point(3, 58) }));
        });
    });

    describe('imageViewerState.toJson() method', () => {
        test('it returns JSON object', () => {
            expect(new ImageViewerState().toJson()).toEqual({ type: 'image' });
        });
    });
});
