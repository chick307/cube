import { ViewerState, viewerStateTypes } from './viewer-state';

export type SymbolicLinkViewerStateJson = {
    type: 'symbolic-link';
};

export class SymbolicLinkViewerState extends ViewerState {
    readonly type = 'symbolic-link';

    static fromJson(json: SymbolicLinkViewerStateJson): SymbolicLinkViewerState;

    static fromJson(json: unknown): SymbolicLinkViewerState;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any): SymbolicLinkViewerState {
        if (json == null || json.type !== 'symbolic-link')
            throw Error();
        const symbolicLinkViewerState = new SymbolicLinkViewerState();
        return symbolicLinkViewerState;
    }

    override toJson(): SymbolicLinkViewerStateJson {
        return {
            type: 'symbolic-link',
        };
    }
}

declare module './viewer-state' {
    interface ViewerStateTypes {
        'symbolic-link': typeof SymbolicLinkViewerState;
    }
}

viewerStateTypes['symbolic-link'] = SymbolicLinkViewerState;
