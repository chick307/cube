import { Restate, State } from '../../common/utils/restate';
import type { HistoryState, MutableHistoryStore, State as HistoryStoreState } from '../stores/history-store';
import type { Store } from '../stores/store';

export type HistoryController = {
    historyStore: Store<HistoryStoreState>;

    state: State<HistoryStoreState>;

    goBack(): void;

    goForward(): void;

    navigate(state: HistoryState): void;

    replace(state: HistoryState): void;
};

export class HistoryControllerImpl implements HistoryController {
    #restate: Restate<HistoryStoreState>;

    private _historyStore: MutableHistoryStore & Store<HistoryStoreState>;

    constructor(container: {
        historyStore: MutableHistoryStore & Store<HistoryStoreState>;
    }) {
        this._historyStore = container.historyStore;
        this.#restate = new Restate<HistoryStoreState>(this._historyStore.state);

        this._historyStore.subscribe({
            next: (state) => {
                this.#restate.set(state);
            },
        });
    }

    get state(): State<HistoryStoreState> {
        return this.#restate.state;
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
