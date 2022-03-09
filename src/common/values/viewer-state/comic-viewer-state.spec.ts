import { ComicViewerState } from '../viewer-state';

describe('ComicViewerState class', () => {
    describe('ComicViewerState.fromJson() method', () => {
        test('it returns an instance of ComicViewerState class', () => {
            expect(ComicViewerState.fromJson({ type: 'comic' }))
                .toEqual(new ComicViewerState());
            expect(ComicViewerState.fromJson({ type: 'comic', pageDisplay: 'single' }))
                .toEqual(new ComicViewerState({ pageDisplay: 'single' }));
            expect(ComicViewerState.fromJson({ type: 'comic', pageDisplay: 'two' }))
                .toEqual(new ComicViewerState());
        });

        test('it throws an error if the passed JSON is invalid', () => {
            expect(() => ComicViewerState.fromJson(null)).toThrow();
            expect(() => ComicViewerState.fromJson({})).toThrow();
            expect(() => ComicViewerState.fromJson({ type: '' })).toThrow();
            expect(() => ComicViewerState.fromJson({ type: 'binary' })).toThrow();
        });
    });

    describe('comicViewerState.toJson() method', () => {
        test('it returns JSON object', () => {
            expect(new ComicViewerState().toJson())
                .toEqual({ type: 'comic', pageDisplay: 'two' });
            expect(new ComicViewerState({ pageDisplay: 'single' }).toJson())
                .toEqual({ type: 'comic', pageDisplay: 'single' });
            expect(new ComicViewerState({ pageDisplay: 'two' }).toJson())
                .toEqual({ type: 'comic', pageDisplay: 'two' });
        });
    });
});
