import { ViewerState, viewerStateTypes } from './viewer-state';

export type TextViewerStateJson = {
    type: 'text';
};

export class TextViewerState extends ViewerState {
    readonly type = 'text';

    static fromJson(json: TextViewerStateJson): TextViewerState;

    static fromJson(json: unknown): TextViewerState;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any): TextViewerState {
        if (json == null || json.type !== 'text')
            throw Error();
        const textViewerState = new TextViewerState();
        return textViewerState;
    }

    override toJson(): TextViewerStateJson {
        return {
            type: 'text',
        };
    }
}

declare module './viewer-state' {
    interface ViewerStateTypes {
        text: typeof TextViewerState;
    }
}

viewerStateTypes['text'] = TextViewerState;
