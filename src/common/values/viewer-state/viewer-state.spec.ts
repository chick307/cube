import * as ViewerStates from '../viewer-state';

describe('ViewerState class', () => {
    describe('ViewerState.fromJson() method', () => {
        test('it returns an instance of ViewerState class', () => {
            expect(ViewerStates.ViewerState.fromJson({ type: 'binary' }))
                .toEqual(new ViewerStates.BinaryViewerState());
            expect(ViewerStates.ViewerState.fromJson({ type: 'comic' }))
                .toEqual(new ViewerStates.ComicViewerState());
            expect(ViewerStates.ViewerState.fromJson({ type: 'directory' }))
                .toEqual(new ViewerStates.DirectoryViewerState());
            expect(ViewerStates.ViewerState.fromJson({ type: 'image' }))
                .toEqual(new ViewerStates.ImageViewerState());
            expect(ViewerStates.ViewerState.fromJson({ type: 'markdown' }))
                .toEqual(new ViewerStates.MarkdownViewerState());
            expect(ViewerStates.ViewerState.fromJson({ type: 'media' }))
                .toEqual(new ViewerStates.MediaViewerState());
            expect(ViewerStates.ViewerState.fromJson({ type: 'pdf' }))
                .toEqual(new ViewerStates.PdfViewerState());
            expect(ViewerStates.ViewerState.fromJson({ type: 'symbolic-link' }))
                .toEqual(new ViewerStates.SymbolicLinkViewerState());
            expect(ViewerStates.ViewerState.fromJson({ type: 'text' }))
                .toEqual(new ViewerStates.TextViewerState());
        });

        test('it throws an error if the passed JSON is invalid', () => {
            expect(() => ViewerStates.ViewerState.fromJson(null)).toThrow();
            expect(() => ViewerStates.ViewerState.fromJson({})).toThrow();
            expect(() => ViewerStates.ViewerState.fromJson({ type: '' })).toThrow();
        });
    });
});
