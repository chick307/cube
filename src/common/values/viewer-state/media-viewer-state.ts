import { defineViewerState, ViewerState } from './viewer-state';

export type MediaViewerStateJson = {
    type: 'media';
};

export class MediaViewerState extends ViewerState {
    readonly type = 'media';

    static fromJson(json: MediaViewerStateJson): MediaViewerState;

    static fromJson(json: unknown): MediaViewerState;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any): MediaViewerState {
        if (json == null || json.type !== 'media')
            throw Error();
        const mediaViewerState = new MediaViewerState();
        return mediaViewerState;
    }

    override toJson(): MediaViewerStateJson {
        return {
            type: 'media',
        };
    }

    static {
        defineViewerState('media', this);
    }
}

declare module './viewer-state' {
    interface ViewerStateTypes {
        media: typeof MediaViewerState;
    }
}
