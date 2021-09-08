import { ViewerState, viewerStateTypes } from './viewer-state';

export type TsvViewerStateJson = {
    type: 'tsv';
};

export class TsvViewerState extends ViewerState {
    readonly type = 'tsv';

    static fromJson(json: TsvViewerStateJson): TsvViewerState;

    static fromJson(json: unknown): TsvViewerState;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any): TsvViewerState {
        if (json == null || json.type !== 'tsv')
            throw Error();
        const tsvViewerState = new TsvViewerState();
        return tsvViewerState;
    }

    override toJson(): TsvViewerStateJson {
        return {
            type: 'tsv',
        };
    }
}

declare module './viewer-state' {
    interface ViewerStateTypes {
        tsv: typeof TsvViewerState;
    }
}

viewerStateTypes['tsv'] = TsvViewerState;
