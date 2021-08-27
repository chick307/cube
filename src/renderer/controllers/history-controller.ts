import type { Entry } from '../../common/entities/entry';
import type { FileSystem } from '../../common/entities/file-system';
import { Restate, State } from '../../common/utils/restate';

export type HistoryItem = {
    entry: Entry;
    fileSystem: FileSystem;
};

export type HistoryControllerState = {
    ableToGoBack: boolean;
    ableToGoForward: boolean;
    current: HistoryItem;
};

export type HistoryController = {
    readonly state: State<HistoryControllerState>;

    goBack(): void;

    goForward(): void;

    navigate(item: HistoryItem): void;

    replace(item: HistoryItem): void;
};

type InternalState = {
    backHistories: HistoryItem[];
    current: HistoryItem;
    forwardHistories: HistoryItem[];
};

export class HistoryControllerImpl implements HistoryController {
    #restate: Restate<InternalState>;

    #state: State<HistoryControllerState>;

    constructor(params: {
        initialHistoryItem: HistoryItem;
    }) {
        this.#restate = new Restate<InternalState>({
            backHistories: [],
            current: params.initialHistoryItem,
            forwardHistories: [],
        });

        this.#state = this.#restate.state.map(({
            backHistories,
            current,
            forwardHistories,
        }) => ({
            ableToGoBack: backHistories.length > 0,
            ableToGoForward: forwardHistories.length > 0,
            current,
        }));
    }

    get state(): State<HistoryControllerState> {
        return this.#state;
    }

    goBack(): void {
        this.#restate.update((state) => {
            const index = state.backHistories.length - 1;
            if (index < 0)
                return state;
            const backHistories = state.backHistories.slice(0, index);
            const current = state.backHistories[index];
            const forwardHistories = [state.current, ...state.forwardHistories];
            return { ...state, backHistories, current, forwardHistories };
        });
    }

    goForward(): void {
        this.#restate.update((state) => {
            if (state.forwardHistories.length === 0)
                return state;
            const backHistories = [...state.backHistories, state.current];
            const current = state.forwardHistories[0];
            const forwardHistories = state.forwardHistories.slice(1);
            return { ...state, backHistories, current, forwardHistories };
        });
    }

    navigate(item: HistoryItem): void {
        this.#restate.update((state) => {
            const backHistories = [...state.backHistories, state.current];
            const current = { entry: item.entry, fileSystem: item.fileSystem };
            return { ...state, backHistories, current, forwardHistories: [] };
        });
    }

    replace(item: HistoryItem): void {
        this.#restate.update((state) => {
            const current = { entry: item.entry, fileSystem: item.fileSystem };
            return { ...state, current };
        });
    }
}
