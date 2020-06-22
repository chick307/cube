import { Entry } from '../entities/entry';
import { FileSystem } from '../services/file-system';
import { LocalFileSystemService } from '../services/local-file-system-service';
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

export class EntryStore extends Store<State> {
    constructor(container: {
        localFileSystemService: LocalFileSystemService;
    }) {
        super({
            entry: container.localFileSystemService.getHomeDirectory(),
            fileSystem: container.localFileSystemService,
            histories: [],
        });
    }

    canGoBack() {
        return this.state.histories.length > 0;
    }

    goBack() {
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

    setEntry(entry: Entry, fileSystem: FileSystem) {
        this.setState({
            entry,
            fileSystem,
            histories: [
                ...this.state.histories,
                { entry: this.state.entry, fileSystem: this.state.fileSystem },
            ],
        });
    }
}
