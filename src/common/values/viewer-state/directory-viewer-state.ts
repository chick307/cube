import { ViewerState, viewerStateTypes } from './viewer-state';

export type DirectoryViewerStateJson = {
    type: 'directory';
};

export class DirectoryViewerState extends ViewerState {
    readonly type = 'directory';

    static fromJson(json: DirectoryViewerStateJson): DirectoryViewerState;

    static fromJson(json: unknown): DirectoryViewerState;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any): DirectoryViewerState {
        if (json == null || json.type !== 'directory')
            throw Error();
        const directoryViewerState = new DirectoryViewerState();
        return directoryViewerState;
    }

    override toJson(): DirectoryViewerStateJson {
        return {
            type: 'directory',
        };
    }
}

declare module './viewer-state' {
    interface ViewerStateTypes {
        directory: typeof DirectoryViewerState;
    }
}

viewerStateTypes['directory'] = DirectoryViewerState;
