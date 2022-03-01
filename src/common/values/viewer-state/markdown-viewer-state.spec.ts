import { MarkdownViewerState } from '../viewer-state';

describe('MarkdownViewerState class', () => {
    describe('MarkdownViewerState.fromJson() method', () => {
        test('it returns an instance of MarkdownViewerState class', () => {
            expect(MarkdownViewerState.fromJson({ type: 'markdown' })).toEqual(new MarkdownViewerState());
        });

        test('it throws an error if the passed JSON is invalid', () => {
            expect(() => MarkdownViewerState.fromJson(null)).toThrow();
            expect(() => MarkdownViewerState.fromJson({})).toThrow();
            expect(() => MarkdownViewerState.fromJson({ type: '' })).toThrow();
            expect(() => MarkdownViewerState.fromJson({ type: 'binary' })).toThrow();
        });
    });

    describe('markdownViewerState.toJson() method', () => {
        test('it returns JSON object', () => {
            expect(new MarkdownViewerState().toJson()).toEqual({ type: 'markdown' });
        });
    });
});
