import { Point } from '../point';
import { MarkdownViewerState } from '../viewer-state';

const defaultJson = {
    type: 'markdown',
    scrollPosition: Point.zero,
};

describe('MarkdownViewerState class', () => {
    describe('MarkdownViewerState.fromJson() method', () => {
        test('it returns an instance of MarkdownViewerState class', () => {
            expect(MarkdownViewerState.fromJson({ type: 'markdown' })).toEqual(new MarkdownViewerState());
            expect(MarkdownViewerState.fromJson({ type: 'markdown', scrollPosition: new Point(1, 23) }))
                .toEqual(new MarkdownViewerState({ scrollPosition: new Point(1, 23) }));
        });

        test('it throws an error if the passed JSON is invalid', () => {
            expect(() => MarkdownViewerState.fromJson(null)).toThrow();
            expect(() => MarkdownViewerState.fromJson({})).toThrow();
            expect(() => MarkdownViewerState.fromJson({ type: '' })).toThrow();
            expect(() => MarkdownViewerState.fromJson({ type: 'binary' })).toThrow();
        });
    });

    describe('markdownViewerState.setScrollPosition() method', () => {
        test('it creates a new state', () => {
            expect(new MarkdownViewerState().setScrollPosition(new Point(3, 14)))
                .toEqual(new MarkdownViewerState({ scrollPosition: new Point(3, 14) }));
            expect(new MarkdownViewerState({ scrollPosition: new Point(1, 12) }).setScrollPosition(new Point(3, 58)))
                .toEqual(new MarkdownViewerState({ scrollPosition: new Point(3, 58) }));
        });
    });

    describe('markdownViewerState.toJson() method', () => {
        test('it returns JSON object', () => {
            expect(new MarkdownViewerState().toJson()).toEqual({ ...defaultJson });
            expect(new MarkdownViewerState({ scrollPosition: new Point(1, 23) }).toJson())
                .toEqual({ ...defaultJson, scrollPosition: { x: 1, y: 23 } });
        });
    });
});
