import { ViewerState } from '.';
import { viewerStateTypes } from './viewer-state';

export class DummyViewerState extends ViewerState {
    readonly type = 'dummy';

    static fromJson(json: unknown): DummyViewerState;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any): DummyViewerState {
        if (json == null || json.type !== 'dummy')
            throw Error();
        const dummyViewerState = new DummyViewerState();
        return dummyViewerState;
    }

    toJson() {
        return {
            type: 'dummy',
        };
    }
}

declare module './viewer-state' {
    interface ViewerStateTypes {
        dummy: typeof DummyViewerState;
    }
}

viewerStateTypes['dummy'] = DummyViewerState;
