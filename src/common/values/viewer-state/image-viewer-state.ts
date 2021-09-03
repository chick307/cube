import { ViewerState, viewerStateTypes } from './viewer-state';

export type ImageViewerStateJson = {
    type: 'image';
};

export class ImageViewerState extends ViewerState {
    readonly type = 'image';

    static fromJson(json: ImageViewerStateJson): ImageViewerState;

    static fromJson(json: unknown): ImageViewerState;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any): ImageViewerState {
        if (json == null || json.type !== 'image')
            throw Error();
        const imageViewerState = new ImageViewerState();
        return imageViewerState;
    }

    override toJson(): ImageViewerStateJson {
        return {
            type: 'image',
        };
    }
}

declare module './viewer-state' {
    interface ViewerStateTypes {
        image: typeof ImageViewerState;
    }
}

viewerStateTypes['image'] = ImageViewerState;
