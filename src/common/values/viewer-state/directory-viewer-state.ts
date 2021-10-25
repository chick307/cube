import { ViewerState, viewerStateTypes } from './viewer-state';

export type DirectoryViewerStateJson = {
    hiddenEntriesVisible?: boolean;

    type: 'directory';
};

export class DirectoryViewerState extends ViewerState {
    readonly hiddenEntriesVisible: boolean;

    readonly type = 'directory';

    constructor(params?: {
        hiddenEntriesVisible?: boolean | null | undefined;
    } | null | undefined) {
        super();
        this.hiddenEntriesVisible = params?.hiddenEntriesVisible ?? false;
    }

    static fromJson(json: DirectoryViewerStateJson): DirectoryViewerState;

    static fromJson(json: unknown): DirectoryViewerState;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any): DirectoryViewerState {
        if (json == null || json.type !== 'directory')
            throw Error();
        const hiddenEntriesVisible = json.hiddenEntriesVisible === true;
        const directoryViewerState = new DirectoryViewerState({ hiddenEntriesVisible });
        return directoryViewerState;
    }

    override toJson(): DirectoryViewerStateJson {
        return {
            hiddenEntriesVisible: this.hiddenEntriesVisible,
            type: 'directory',
        };
    }

    toggleHiddenFilesVisible(): DirectoryViewerState {
        return new DirectoryViewerState({
            hiddenEntriesVisible: !this.hiddenEntriesVisible,
        });
    }
}

declare module './viewer-state' {
    interface ViewerStateTypes {
        directory: typeof DirectoryViewerState;
    }
}

viewerStateTypes['directory'] = DirectoryViewerState;
