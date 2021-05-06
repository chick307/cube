import type { Entry } from '../../common/entities/entry';
import type { FileSystem } from '../services/file-system';
import type { MutableHistoryStore } from '../stores/history-store';

export type HistoryController = {
    goBack(): void;
    navigate(state: {
        entry: Entry;
        fileSystem: FileSystem;
    }): void;
};

export class HistoryControllerImpl implements HistoryController {
    private _historyStore: MutableHistoryStore;

    constructor(container: {
        historyStore: MutableHistoryStore;
    }) {
        this._historyStore = container.historyStore;
    }

    goBack(): void {
        this._historyStore.pop();
    }

    navigate(state: {
        entry: Entry;
        fileSystem: FileSystem;
    }): void {
        this._historyStore.push({
            entry: state.entry,
            fileSystem: state.fileSystem,
        });
    }
}
