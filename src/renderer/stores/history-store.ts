import { Entry } from '../../common/entities/entry';
import { FileSystem } from '../services/file-system';
import { Store } from './store';

export type HistoryState = {
    entry: Entry;
    fileSystem: FileSystem;
};

export type State = {
    current: HistoryState;
    historyStates: HistoryState[];
};

export type Observer = {
    next: (state: State) => void;
};

export type MutableHistoryStore = {
    pop(): void;
    push(state: HistoryState): void;
    replace(state: HistoryState): void;
};

export class HistoryStore extends Store<State> implements MutableHistoryStore {
    constructor(params: {
        historyState: HistoryState;
    }) {
        super({
            current: {
                entry: params.historyState.entry,
                fileSystem: params.historyState.fileSystem,
            },
            historyStates: [],
        });
    }

    canGoBack() {
        return this.state.historyStates.length > 0;
    }

    pop(): void {
        const index = this.state.historyStates.length - 1;
        if (index < 0)
            throw Error();
        const historyState = this.state.historyStates[index];
        this.setState({
            ...this.state,
            current: historyState,
            historyStates: this.state.historyStates.slice(0, index),
        });
    }

    push(state: HistoryState) {
        this.setState({
            ...this.state,
            current: {
                entry: state.entry,
                fileSystem: state.fileSystem,
            },
            historyStates: [
                ...this.state.historyStates,
                this.state.current,
            ],
        });
    }

    replace(state: HistoryState) {
        this.setState({
            ...this.state,
            current: {
                entry: state.entry,
                fileSystem: state.fileSystem,
            },
        });
    }
}
