import { ViewerState, viewerStateTypes } from './viewer-state';

export type PdfViewerStateJson = {
    type: 'pdf';
};

export class PdfViewerState extends ViewerState {
    readonly type = 'pdf';

    static fromJson(json: PdfViewerStateJson): PdfViewerState;

    static fromJson(json: unknown): PdfViewerState;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any): PdfViewerState {
        if (json == null || json.type !== 'pdf')
            throw Error();
        const pdfViewerState = new PdfViewerState();
        return pdfViewerState;
    }

    override toJson(): PdfViewerStateJson {
        return {
            type: 'pdf',
        };
    }
}

declare module './viewer-state' {
    interface ViewerStateTypes {
        pdf: typeof PdfViewerState;
    }
}

viewerStateTypes['pdf'] = PdfViewerState;
