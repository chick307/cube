import { Point, PointJson } from '../point';
import { defineViewerState, ViewerState } from './viewer-state';

export type MarkdownViewerStateJson = {
    type: 'markdown';

    scrollPosition?: PointJson | null | undefined;
};

export class MarkdownViewerState extends ViewerState {
    readonly scrollPosition: Point;

    readonly type = 'markdown';

    constructor(params?: {
        readonly scrollPosition?: Point | null | undefined;
    }) {
        super();
        this.scrollPosition = params?.scrollPosition ?? Point.zero;
    }

    static fromJson(json: MarkdownViewerStateJson): MarkdownViewerState;

    static fromJson(json: unknown): MarkdownViewerState;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any): MarkdownViewerState {
        if (json == null || json.type !== 'markdown')
            throw Error();
        const scrollPosition = json.scrollPosition == null ? null : Point.fromJson(json.scrollPosition);
        const markdownViewerState = new MarkdownViewerState({ scrollPosition });
        return markdownViewerState;
    }

    setScrollPosition(position: Point): MarkdownViewerState {
        return new MarkdownViewerState({
            scrollPosition: position,
        });
    }

    override toJson(): MarkdownViewerStateJson {
        return {
            type: 'markdown',
            scrollPosition: this.scrollPosition.toJson(),
        };
    }

    static {
        defineViewerState('markdown', this);
    }
}

declare module './viewer-state' {
    interface ViewerStateTypes {
        markdown: typeof MarkdownViewerState;
    }
}
