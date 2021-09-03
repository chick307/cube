import { PdfViewerState } from '.';

describe('PdfViewerState class', () => {
    describe('PdfViewerState.fromJson() method', () => {
        test('it returns an instance of PdfViewerState class', () => {
            expect(PdfViewerState.fromJson({ type: 'pdf' })).toEqual(new PdfViewerState());
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
            expect(new PdfViewerState().toJson()).toEqual({ type: 'pdf' });
        });
    });
});
