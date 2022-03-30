import { Point, PointJson } from '../point';
import { ViewerState, viewerStateTypes } from './viewer-state';

export type TextViewerStateJson = {
    type: 'text';

    scrollPosition?: PointJson | null | undefined;
};

export class TextViewerState extends ViewerState {
    readonly scrollPosition: Point;

    readonly type = 'text';

    constructor(params?: {
        readonly scrollPosition?: Point | null | undefined;
    }) {
        super();
        this.scrollPosition = params?.scrollPosition ?? new Point(0, 0);
    }

    static fromJson(json: TextViewerStateJson): TextViewerState;

    static fromJson(json: unknown): TextViewerState;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any): TextViewerState {
        if (json == null || json.type !== 'text')
            throw Error();
        const scrollPosition = json.scrollPosition == null ? null : Point.fromJson(json.scrollPosition);
        const textViewerState = new TextViewerState({ scrollPosition });
        return textViewerState;
    }

    setScrollPosition(position: Point): TextViewerState {
        return new TextViewerState({
            scrollPosition: position,
        });
    }

    override toJson(): TextViewerStateJson {
        return {
            type: 'text',
            scrollPosition: this.scrollPosition.toJson(),
        };
    }
}

declare module './viewer-state' {
    interface ViewerStateTypes {
        text: typeof TextViewerState;
    }
}

viewerStateTypes['text'] = TextViewerState;
