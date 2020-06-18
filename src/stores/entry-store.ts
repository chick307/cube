import { Entry } from '../entities/entry';
import { LocalFileSystemService } from '../services/local-file-system-service';
import { Store } from './store';

export type State = {
    entry: Entry;
};

export type Observer = {
    next: (state: State) => void;
};

export class EntryStore extends Store<State> {
    private _localFileSystemService: LocalFileSystemService;

    constructor(container: {
        localFileSystemService: LocalFileSystemService;
    }) {
        super({
            entry: container.localFileSystemService.getHomeDirectory(),
        });

        this._localFileSystemService = container.localFileSystemService;
    }

    get localFileSystemService(): LocalFileSystemService {
        return this._localFileSystemService;
    }

    setEntry(entry: Entry) {
        this.setState({
            entry,
        });
    }
}
