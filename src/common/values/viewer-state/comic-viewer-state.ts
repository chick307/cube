import { ViewerState, viewerStateTypes } from './viewer-state';

export type ComicViewerStateJson = {
    type: 'comic';
};

export class ComicViewerState extends ViewerState {
    readonly type = 'comic';

    static fromJson(json: ComicViewerStateJson): ComicViewerState;

    static fromJson(json: unknown): ComicViewerState;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any): ComicViewerState {
        if (json == null || json.type !== 'comic')
            throw Error();
        const comicViewerState = new ComicViewerState();
        return comicViewerState;
    }

    override toJson(): ComicViewerStateJson {
        return {
            type: 'comic',
        };
    }
}

declare module './viewer-state' {
    interface ViewerStateTypes {
        comic: typeof ComicViewerState;
    }
}

viewerStateTypes['comic'] = ComicViewerState;
