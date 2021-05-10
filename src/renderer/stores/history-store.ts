import { Entry } from '../../common/entities/entry';
import { FileSystem } from '../services/file-system';
import { Store } from './store';

export type HistoryState = {
    entry: Entry;
    fileSystem: FileSystem;
};

const createHistoryState = (state: HistoryState) => {
    return {
        entry: state.entry,
        fileSystem: state.fileSystem,
    };
};

export type State = {
    ableToGoBack: boolean;
    ableToGoForward: boolean;
    backHistories: HistoryState[];
    current: HistoryState;
    forwardHistories: HistoryState[];
};

export type Observer = {
    next: (state: State) => void;
};

export type MutableHistoryStore = {
    push(state: HistoryState): void;
    replace(state: HistoryState): void;
    shiftBack(): void;
    shiftForward(): void;
};

export class HistoryStore extends Store<State> implements MutableHistoryStore {
    constructor(params: {
        historyState: HistoryState;
    }) {
        super({
            ableToGoBack: false,
            ableToGoForward: false,
            backHistories: [],
            current: createHistoryState(params.historyState),
            forwardHistories: [],
        });
    }

    push(state: HistoryState) {
        this.updateState((oldState) => {
            return {
                ...oldState,
                backHistories: [
                    ...oldState.backHistories,
                    oldState.current,
                ],
                current: createHistoryState(state),
                forwardHistories: [],
            };
        });
    }

    replace(state: HistoryState) {
        this.updateState((oldState) => {
            return {
                ...oldState,
                current: createHistoryState(state),
            };
        });
    }

    shiftBack(): void {
        this.updateState((oldState) => {
            const index = oldState.backHistories.length - 1;
            if (index < 0)
                return oldState;
            const state = oldState.backHistories[index];
            return {
                ...oldState,
                backHistories: oldState.backHistories.slice(0, index),
                current: state,
                forwardHistories: [
                    oldState.current,
                    ...oldState.forwardHistories,
                ],
            };
        });
    }

    shiftForward(): void {
        this.updateState((oldState) => {
            if (oldState.forwardHistories.length === 0)
                return oldState;
            return {
                ...oldState,
                backHistories: [...oldState.backHistories, oldState.current],
                current: oldState.forwardHistories[0],
                forwardHistories: oldState.forwardHistories.slice(1),
            };
        });
    }

    protected updateState(updater: (oldState: State) => State): void {
        super.updateState((oldState) => {
            const newState = updater(oldState);
            return {
                ...newState,
                ableToGoBack: newState.backHistories.length !== 0,
                ableToGoForward: newState.forwardHistories.length !== 0,
            };
        });
    }
}
