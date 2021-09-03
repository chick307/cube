import { ViewerState, ViewerStateJson } from '../values/viewer-state';
import { Entry, EntryJson } from './entry';
import { FileSystem, FileSystemJson } from './file-system';

export type HistoryItemJson = {
    entry: EntryJson;
    fileSystem: FileSystemJson;
    viewerState: ViewerStateJson | null;
};

export class HistoryItem {
    readonly entry: Entry;

    readonly fileSystem: FileSystem;

    readonly viewerState: ViewerState | null;

    constructor(params: {
        entry: Entry;
        fileSystem: FileSystem;
        viewerState?: ViewerState | null;
    }) {
        this.entry = params.entry;
        this.fileSystem = params.fileSystem;
        this.viewerState = params.viewerState ?? null;
    }

    static fromJson(json: HistoryItemJson): HistoryItem;

    static fromJson(json: unknown): HistoryItem;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any): HistoryItem {
        if (json == null || !('entry' in json) && !('fileSystem' in json))
            throw Error();
        const entry = Entry.fromJson(json.entry);
        const fileSystem = FileSystem.fromJson(json.fileSystem);
        const viewerState = json.viewerState == null ? null : ViewerState.fromJson(json.viewerState);
        const historyItem = new HistoryItem({ entry, fileSystem, viewerState });
        return historyItem;
    }

    toJson(): HistoryItemJson {
        return {
            entry: this.entry.toJson(),
            fileSystem: this.fileSystem.toJson(),
            viewerState: this.viewerState?.toJson() ?? null,
        };
    }
}
