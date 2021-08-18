import type { HistoryState, MutableHistoryStore, State as HistoryStoreState } from '../stores/history-store';
import type { Store } from '../stores/store';

export type HistoryController = {
    historyStore: Store<HistoryStoreState>;

    goBack(): void;

    goForward(): void;

    navigate(state: HistoryState): void;

    replace(state: HistoryState): void;
};

export class HistoryControllerImpl implements HistoryController {
    private _historyStore: MutableHistoryStore & Store<HistoryStoreState>;

    constructor(container: {
        historyStore: MutableHistoryStore & Store<HistoryStoreState>;
    }) {
        this._historyStore = container.historyStore;
    }

    get historyStore(): Store<HistoryStoreState> {
        return this._historyStore;
    }

    goBack(): void {
        this._historyStore.shiftBack();
    }

    goForward(): void {
        this._historyStore.shiftForward();
    }

    navigate(state: HistoryState): void {
        this._historyStore.push(state);
    }

    replace(state: HistoryState) {
        this._historyStore.replace(state);
    }
}
