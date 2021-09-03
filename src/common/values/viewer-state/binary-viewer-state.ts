import { ViewerState, viewerStateTypes } from './viewer-state';

export type BinaryViewerStateJson = {
    type: 'binary';
};

export class BinaryViewerState extends ViewerState {
    readonly type = 'binary';

    static fromJson(json: BinaryViewerStateJson): BinaryViewerState;

    static fromJson(json: unknown): BinaryViewerState;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any): BinaryViewerState {
        if (json == null || json.type !== 'binary')
            throw Error();
        const binaryViewerState = new BinaryViewerState();
        return binaryViewerState;
    }

    override toJson(): BinaryViewerStateJson {
        return {
            type: 'binary',
        };
    }
}

declare module './viewer-state' {
    interface ViewerStateTypes {
        binary: typeof BinaryViewerState;
    }
}

viewerStateTypes['binary'] = BinaryViewerState;
