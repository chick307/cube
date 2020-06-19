import { Entry } from '../entities/entry';
import { FileSystem } from '../services/file-system';
import { LocalFileSystemService } from '../services/local-file-system-service';
import { Store } from './store';

export type State = {
    entry: Entry;
    fileSystem: FileSystem;
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
        });
    }

    setEntry(entry: Entry, fileSystem: FileSystem) {
        this.setState({
            entry,
            fileSystem,
        });
    }
}
