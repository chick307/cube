import { Entry } from '../../common/entities/entry';
import { FileSystem } from '../services/file-system';
import { Store } from './store';

export type State = {
    entry: Entry;
    fileSystem: FileSystem;
    histories: {
        entry: Entry;
        fileSystem: FileSystem;
    }[];
};

export type Observer = {
    next: (state: State) => void;
};

export type MutableHistoryStore = {
    pop(): void;
    push(state: {
        entry: Entry;
        fileSystem: FileSystem;
    }): void;
};

export class HistoryStore extends Store<State> implements MutableHistoryStore {
    constructor(params: {
        entry: Entry;
        fileSystem: FileSystem;
    }) {
        super({
            entry: params.entry,
            fileSystem: params.fileSystem,
            histories: [],
        });
    }

    canGoBack() {
        return this.state.histories.length > 0;
    }

    pop(): void {
        const index = this.state.histories.length - 1;
        if (index < 0)
            throw Error();
        const { entry, fileSystem } = this.state.histories[index];
        this.setState({
            ...this.state,
            entry,
            fileSystem,
            histories: this.state.histories.slice(0, index),
        });
    }

    push(state: {
        entry: Entry;
        fileSystem: FileSystem;
    }) {
        this.setState({
            entry: state.entry,
            fileSystem: state.fileSystem,
            histories: [
                ...this.state.histories,
                { entry: this.state.entry, fileSystem: this.state.fileSystem },
            ],
        });
    }
}
