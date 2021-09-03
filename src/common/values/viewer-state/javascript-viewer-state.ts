import { ViewerState, viewerStateTypes } from './viewer-state';

export type JavaScriptViewerStateJson = {
    type: 'javascript';
};

export class JavaScriptViewerState extends ViewerState {
    readonly type = 'javascript';

    static fromJson(json: JavaScriptViewerStateJson): JavaScriptViewerState;

    static fromJson(json: unknown): JavaScriptViewerState;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any): JavaScriptViewerState {
        if (json == null || json.type !== 'javascript')
            throw Error();
        const javascriptViewerState = new JavaScriptViewerState();
        return javascriptViewerState;
    }

    override toJson(): JavaScriptViewerStateJson {
        return {
            type: 'javascript',
        };
    }
}

declare module './viewer-state' {
    interface ViewerStateTypes {
        javascript: typeof JavaScriptViewerState;
    }
}

viewerStateTypes['javascript'] = JavaScriptViewerState;
