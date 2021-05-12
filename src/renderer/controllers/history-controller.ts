import type { HistoryState, MutableHistoryStore } from '../stores/history-store';

export type HistoryController = {
    goBack(): void;
    goForward(): void;
    navigate(state: HistoryState): void;
    replace(state: HistoryState): void;
};

export class HistoryControllerImpl implements HistoryController {
    private _historyStore: MutableHistoryStore;

    constructor(container: {
        historyStore: MutableHistoryStore;
    }) {
        this._historyStore = container.historyStore;
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
