import { ViewerState, viewerStateTypes } from './viewer-state';

export type MarkdownViewerStateJson = {
    type: 'markdown';
};

export class MarkdownViewerState extends ViewerState {
    readonly type = 'markdown';

    static fromJson(json: MarkdownViewerStateJson): MarkdownViewerState;

    static fromJson(json: unknown): MarkdownViewerState;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any): MarkdownViewerState {
        if (json == null || json.type !== 'markdown')
            throw Error();
        const markdownViewerState = new MarkdownViewerState();
        return markdownViewerState;
    }

    override toJson(): MarkdownViewerStateJson {
        return {
            type: 'markdown',
        };
    }
}

declare module './viewer-state' {
    interface ViewerStateTypes {
        markdown: typeof MarkdownViewerState;
    }
}

viewerStateTypes['markdown'] = MarkdownViewerState;
