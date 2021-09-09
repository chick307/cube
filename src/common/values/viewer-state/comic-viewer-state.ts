import { ViewerState, viewerStateTypes } from './viewer-state';

export type ComicViewerStateJson = {
    type: 'comic';
    pageDisplay?: ComicViewerPageDisplay;
};

export type ComicViewerPageDisplay = 'single' | 'two';

export class ComicViewerState extends ViewerState {
    readonly type = 'comic';

    readonly pageDisplay: ComicViewerPageDisplay;

    constructor(params?: {
        pageDisplay?: ComicViewerPageDisplay;
    }) {
        super();
        this.pageDisplay = params?.pageDisplay ?? 'two';
    }

    static fromJson(json: ComicViewerStateJson): ComicViewerState;

    static fromJson(json: unknown): ComicViewerState;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any): ComicViewerState {
        if (json == null || json.type !== 'comic')
            throw Error();
        const pageDisplay = json.pageDisplay === 'single' ? 'single' : 'two';
        const comicViewerState = new ComicViewerState({ pageDisplay });
        return comicViewerState;
    }

    override toJson(): ComicViewerStateJson {
        return {
            type: 'comic',
            pageDisplay: this.pageDisplay,
        };
    }
}

declare module './viewer-state' {
    interface ViewerStateTypes {
        comic: typeof ComicViewerState;
    }
}

viewerStateTypes['comic'] = ComicViewerState;
