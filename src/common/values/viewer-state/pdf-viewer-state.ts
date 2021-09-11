import { ViewerState, viewerStateTypes } from './viewer-state';

export type PdfViewerStateJson = {
    type: 'pdf';
    direction?: PdfViewerDirection;
};

export type PdfViewerDirection = 'L2R' | 'R2L' | null;

const pdfViewerDirections = ['L2R', 'R2L', null] as const;

export class PdfViewerState extends ViewerState {
    readonly type = 'pdf';

    readonly direction: PdfViewerDirection;

    constructor(params?: {
        direction?: PdfViewerDirection;
    }) {
        super();
        this.direction = params?.direction ?? null;
    }

    static fromJson(json: PdfViewerStateJson): PdfViewerState;

    static fromJson(json: unknown): PdfViewerState;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any): PdfViewerState {
        if (json == null || json.type !== 'pdf')
            throw Error();
        const direction = pdfViewerDirections.includes(json.direction) ? json.direction : null;
        const pdfViewerState = new PdfViewerState({ direction });
        return pdfViewerState;
    }

    override toJson(): PdfViewerStateJson {
        return {
            type: 'pdf',
            direction: this.direction,
        };
    }
}

declare module './viewer-state' {
    interface ViewerStateTypes {
        pdf: typeof PdfViewerState;
    }
}

viewerStateTypes['pdf'] = PdfViewerState;
