import { defineViewerState, ViewerState } from './viewer-state';

export type CssViewerStateJson = {
    type: 'css';
};

export class CssViewerState extends ViewerState {
    readonly type = 'css';

    static fromJson(json: CssViewerStateJson): CssViewerState;

    static fromJson(json: unknown): CssViewerState;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any): CssViewerState {
        if (json == null || json.type !== 'css')
            throw Error();
        const cssViewerState = new CssViewerState();
        return cssViewerState;
    }

    override toJson(): CssViewerStateJson {
        return {
            type: 'css',
        };
    }

    static {
        defineViewerState('css', this);
    }
}

declare module './viewer-state' {
    interface ViewerStateTypes {
        css: typeof CssViewerState;
    }
}
