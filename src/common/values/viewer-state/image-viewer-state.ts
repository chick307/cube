import { Point, PointJson } from '../point';
import { defineViewerState, ViewerState } from './viewer-state';

export type ImageViewerStateJson = {
    type: 'image';

    scrollPosition?: PointJson | null | undefined;
};

export class ImageViewerState extends ViewerState {
    readonly scrollPosition: Point;

    readonly type = 'image';

    constructor(params?: {
        readonly scrollPosition?: Point | null | undefined;
    }) {
        super();
        this.scrollPosition = params?.scrollPosition ?? new Point(0, 0);
    }

    static fromJson(json: ImageViewerStateJson): ImageViewerState;

    static fromJson(json: unknown): ImageViewerState;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any): ImageViewerState {
        if (json == null || json.type !== 'image')
            throw Error();
        const scrollPosition = json.scrollPosition == null ? null : Point.fromJson(json.scrollPosition);
        const imageViewerState = new ImageViewerState({ scrollPosition });
        return imageViewerState;
    }

    #create(params: {
        readonly scrollPosition?: Point;
    }): ImageViewerState {
        return new ImageViewerState({
            scrollPosition: 'scrollPosition' in params ? params.scrollPosition : this.scrollPosition,
        });
    }

    setScrollPosition(scrollPosition: Point): ImageViewerState {
        return this.#create({ scrollPosition });
    }

    override toJson(): ImageViewerStateJson {
        return {
            type: 'image',
        };
    }

    static {
        defineViewerState('image', this);
    }
}

declare module './viewer-state' {
    interface ViewerStateTypes {
        image: typeof ImageViewerState;
    }
}
