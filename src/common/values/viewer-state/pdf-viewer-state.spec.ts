import { PdfViewerState } from '.';

describe('PdfViewerState class', () => {
    describe('PdfViewerState.fromJson() method', () => {
        test('it returns an instance of PdfViewerState class', () => {
            expect(PdfViewerState.fromJson({ type: 'pdf' })).toEqual(new PdfViewerState());
            expect(PdfViewerState.fromJson({ type: 'pdf', direction: null }))
                .toEqual(new PdfViewerState({ direction: null }));
            expect(PdfViewerState.fromJson({ type: 'pdf', direction: 'L2R' }))
                .toEqual(new PdfViewerState({ direction: 'L2R' }));
            expect(PdfViewerState.fromJson({ type: 'pdf', direction: 'R2L' }))
                .toEqual(new PdfViewerState({ direction: 'R2L' }));
            expect(PdfViewerState.fromJson({ type: 'pdf', pageDisplay: 'single' }))
                .toEqual(new PdfViewerState({ pageDisplay: 'single' }));
            expect(PdfViewerState.fromJson({ type: 'pdf', pageDisplay: 'two' }))
                .toEqual(new PdfViewerState());
        });

        test('it throws an error if the passed JSON is invalid', () => {
            expect(() => PdfViewerState.fromJson(null)).toThrow();
            expect(() => PdfViewerState.fromJson({})).toThrow();
            expect(() => PdfViewerState.fromJson({ type: '' })).toThrow();
            expect(() => PdfViewerState.fromJson({ type: 'binary' })).toThrow();
        });
    });

    describe('pdfViewerState.toJson() method', () => {
        test('it returns JSON object', () => {
            expect(new PdfViewerState().toJson())
                .toEqual({ type: 'pdf', direction: null, pageDisplay: 'two' });
            expect(new PdfViewerState({}).toJson())
                .toEqual({ type: 'pdf', direction: null, pageDisplay: 'two' });
            expect(new PdfViewerState({ direction: 'L2R' }).toJson())
                .toEqual({ type: 'pdf', direction: 'L2R', pageDisplay: 'two' });
            expect(new PdfViewerState({ direction: 'R2L' }).toJson())
                .toEqual({ type: 'pdf', direction: 'R2L', pageDisplay: 'two' });
            expect(new PdfViewerState({ pageDisplay: 'single' }).toJson())
                .toEqual({ type: 'pdf', direction: null, pageDisplay: 'single' });
            expect(new PdfViewerState({ pageDisplay: 'two' }).toJson())
                .toEqual({ type: 'pdf', direction: null, pageDisplay: 'two' });
        });
    });
});
