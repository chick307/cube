import { Point, PointJson } from '../point';
import { defineViewerState, ViewerState } from './viewer-state';

export type TextViewerStateJson = {
    type: 'text';

    language: string;

    scrollPosition?: PointJson | null | undefined;
};

export class TextViewerState extends ViewerState {
    readonly language: string;

    readonly scrollPosition: Point;

    readonly type = 'text';

    constructor(params?: {
        readonly language?: string | null | undefined;
        readonly scrollPosition?: Point | null | undefined;
    }) {
        super();
        this.language = params?.language ?? 'plaintext';
        this.scrollPosition = params?.scrollPosition ?? new Point(0, 0);
    }

    static fromJson(json: TextViewerStateJson): TextViewerState;

    static fromJson(json: unknown): TextViewerState;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any): TextViewerState {
        if (json == null || json.type !== 'text')
            throw Error();
        if (json.language != null && typeof json.language !== 'string')
            throw Error();
        const language = json.language == null ? null : json.language;
        const scrollPosition = json.scrollPosition == null ? null : Point.fromJson(json.scrollPosition);
        const textViewerState = new TextViewerState({ language, scrollPosition });
        return textViewerState;
    }

    #create(params: {
        readonly language?: string;
        readonly scrollPosition?: Point;
    }): TextViewerState {
        return new TextViewerState({
            language: 'language' in params ? params.language : this.language,
            scrollPosition: 'scrollPosition' in params ? params.scrollPosition : this.scrollPosition,
        });
    }

    equals(other: TextViewerState | null | undefined): boolean {
        if (other == null)
            return false;
        if (this.language !== other.language)
            return false;
        if (!this.scrollPosition.equals(other.scrollPosition))
            return false;
        return true;
    }

    setLanguage(language: string): TextViewerState {
        return this.#create({ language });
    }

    setScrollPosition(scrollPosition: Point): TextViewerState {
        return this.#create({ scrollPosition });
    }

    override toJson(): TextViewerStateJson {
        return {
            type: 'text',
            language: this.language,
            scrollPosition: this.scrollPosition.toJson(),
        };
    }

    static {
        defineViewerState('text', this);
    }
}

declare module './viewer-state' {
    interface ViewerStateTypes {
        text: typeof TextViewerState;
    }
}
