import { ViewerState, viewerStateTypes } from './viewer-state';

export type PdfViewerStateJson = {
    type: 'pdf';
    direction?: PdfViewerDirection;
    pageDisplay?: PdfViewerPageDisplay;
};

export type PdfViewerDirection = 'L2R' | 'R2L' | null;

const pdfViewerDirections = ['L2R', 'R2L', null] as const;

export type PdfViewerPageDisplay = 'single' | 'two';

const pdfViewerPageDisplays = ['single', 'two'];

export class PdfViewerState extends ViewerState {
    readonly type = 'pdf';

    readonly direction: PdfViewerDirection;

    readonly pageDisplay: PdfViewerPageDisplay;

    constructor(params?: {
        direction?: PdfViewerDirection;
        pageDisplay?: PdfViewerPageDisplay;
    }) {
        super();
        this.direction = params?.direction ?? null;
        this.pageDisplay = params?.pageDisplay ?? 'two';
    }

    static fromJson(json: PdfViewerStateJson): PdfViewerState;

    static fromJson(json: unknown): PdfViewerState;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any): PdfViewerState {
        if (json == null || json.type !== 'pdf')
            throw Error();
        const direction = pdfViewerDirections.includes(json.direction) ? json.direction : null;
        const pageDisplay = pdfViewerPageDisplays.includes(json.pageDisplay) ? json.pageDisplay : 'two';
        const pdfViewerState = new PdfViewerState({ direction, pageDisplay });
        return pdfViewerState;
    }

    setDirection(value: PdfViewerDirection): PdfViewerState {
        return new PdfViewerState({ ...this, direction: value });
    }

    override toJson(): PdfViewerStateJson {
        return {
            type: 'pdf',
            direction: this.direction,
            pageDisplay: this.pageDisplay,
        };
    }
}

declare module './viewer-state' {
    interface ViewerStateTypes {
        pdf: typeof PdfViewerState;
    }
}

viewerStateTypes['pdf'] = PdfViewerState;
