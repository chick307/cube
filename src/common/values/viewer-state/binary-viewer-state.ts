import { Point, PointJson } from '../point';
import { defineViewerState, ViewerState } from './viewer-state';

export type BinaryViewerStateJson = {
    type: 'binary';

    scrollPosition?: PointJson | null | undefined;
};

export class BinaryViewerState extends ViewerState {
    readonly scrollPosition: Point;

    readonly type = 'binary';

    constructor(params?: {
        readonly scrollPosition?: Point | null | undefined;
    }) {
        super();
        this.scrollPosition = params?.scrollPosition ?? new Point(0, 0);
    }

    static fromJson(json: BinaryViewerStateJson): BinaryViewerState;

    static fromJson(json: unknown): BinaryViewerState;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any): BinaryViewerState {
        if (json == null || json.type !== 'binary')
            throw Error();
        const scrollPosition = json.scrollPosition == null ? null : Point.fromJson(json.scrollPosition);
        const binaryViewerState = new BinaryViewerState({ scrollPosition });
        return binaryViewerState;
    }

    #create(params: {
        readonly scrollPosition?: Point;
    }): BinaryViewerState {
        return new BinaryViewerState({
            scrollPosition: 'scrollPosition' in params ? params.scrollPosition : this.scrollPosition,
        });
    }

    equals(other: BinaryViewerState | null | undefined): boolean {
        if (other == null)
            return false;
        if (!this.scrollPosition.equals(other.scrollPosition))
            return false;
        return true;
    }

    setScrollPosition(scrollPosition: Point): BinaryViewerState {
        return this.#create({ scrollPosition });
    }

    override toJson(): BinaryViewerStateJson {
        return {
            type: 'binary',
            scrollPosition: this.scrollPosition.toJson(),
        };
    }

    static {
        defineViewerState('binary', this);
    }
}

declare module './viewer-state' {
    interface ViewerStateTypes {
        binary: typeof BinaryViewerState;
    }
}
