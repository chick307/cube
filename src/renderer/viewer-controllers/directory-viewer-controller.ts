import type { DirectoryEntry, Entry } from '../../common/entities/entry';
import type { FileSystem } from '../../common/entities/file-system';
import { HistoryItem } from '../../common/entities/history-item';
import { CloseController, CloseSignal } from '../../common/utils/close-controller';
import { Restate, State } from '../../common/utils/restate';
import { DirectoryViewerState } from '../../common/values/viewer-state';
import type { HistoryController } from '../controllers/history-controller';
import type { EntryService } from '../services/entry-service';

export type DirectoryViewerController = {
    readonly state: State<DirectoryViewerControllerState>;

    initialize(params: InitializeParams): void;

    openItem(params: OpenItemParams): void;

    openRandomItem(): void;

    toggleHiddenEntryVisible(): void;
};

export type DirectoryViewerControllerState = {
    readonly hiddenEntryCount: string;

    readonly hiddenEntryVisible: boolean;

    readonly itemCount: string;

    readonly items: DirectoryItem[];

    readonly randomItemOpenable: boolean;
};

export type DirectoryItem = {
    readonly entry: Entry;

    readonly id: string;
};

export type InitializeParams = {
    readonly entry: Entry;

    readonly fileSystem: FileSystem;

    readonly viewerState: DirectoryViewerState;
};

export type OpenItemParams = {
    readonly itemId: string;
};

type InternalState = {
    readonly allItems: DirectoryItem[];

    readonly hiddenEntryCount: number;

    readonly items: DirectoryItem[];

    readonly viewerState: DirectoryViewerState;
};

const defaultViewerState = new DirectoryViewerState();

const initialState: InternalState = {
    allItems: [],
    hiddenEntryCount: 0,
    items: [],
    viewerState: defaultViewerState,
};

export class DirectoryViewerControllerImpl implements DirectoryViewerController {
    #closeController: CloseController | null;

    #entry: Entry | null;

    #entryService: EntryService;

    #fileSystem: FileSystem | null;

    #historyController: HistoryController;

    #restate: Restate<InternalState>;

    #state: State<DirectoryViewerControllerState>;

    #viewerState: DirectoryViewerState | null;

    constructor(params: {
        readonly entryService: EntryService;

        readonly historyController: HistoryController;
    }) {
        this.#entryService = params.entryService;
        this.#historyController = params.historyController;

        this.#closeController = null;
        this.#entry = null;
        this.#fileSystem = null;
        this.#viewerState = null;

        this.#restate = new Restate<InternalState>(initialState);

        this.#state = this.#restate.state.map((state) => {
            const { hiddenEntryCount, items, viewerState } = state;
            const { hiddenEntriesVisible: hiddenEntryVisible } = viewerState;
            return {
                hiddenEntryCount: this.#getItemCountText(hiddenEntryCount),
                hiddenEntryVisible,
                itemCount: this.#getItemCountText(items.length),
                items,
                randomItemOpenable: items.length !== 0,
            };
        });
    }

    get state(): State<DirectoryViewerControllerState> {
        return this.#state;
    }

    #getItemCountText(count: number): string {
        switch (count) {
            case 0: {
                return 'no items';
            }
            case 1: {
                return '1 item';
            }
            default: {
                return `${count} items`;
            }
        }
    }

    async #initialize(params: {
        entry: Entry;
        fileSystem: FileSystem;
        signal: CloseSignal;
        viewerState: DirectoryViewerState;
    }): Promise<void> {
        const { fileSystem, signal } = params;
        const entry = params.entry as DirectoryEntry;
        const allEntries = await this.#entryService.readDirectory({ entry, fileSystem, signal });
        const allItems = allEntries.map((entry, id) => ({ entry, id: id.toString(10) }));
        this.#update((state) => ({ ...state, allItems }));
    }

    #update(callback: (state: InternalState) => InternalState): void {
        this.#restate.update((previousState) => {
            const state = callback(previousState);
            const { allItems, viewerState } = state;
            const { hiddenEntriesVisible } = viewerState;

            const items: DirectoryItem[] = [];
            let hiddenEntryCount = 0;
            for (const item of allItems) {
                if (item.entry.name.startsWithDot()) {
                    if (hiddenEntriesVisible)
                        items.push(item);
                    hiddenEntryCount++;
                } else {
                    items.push(item);
                }
            }

            return {
                ...state,
                hiddenEntryCount,
                items,
            };
        });
    }

    initialize(params: InitializeParams): void {
        const { entry, fileSystem, viewerState } = params;
        if (
            (this.#entry?.equals(entry) ?? this.#entry === entry) &&
            (this.#fileSystem?.equals(fileSystem) ?? this.#fileSystem === fileSystem)
        ) {
            if (this.#viewerState !== viewerState) {
                this.#viewerState = viewerState;
                this.#update((state) => ({ ...state, viewerState }));
            }
            return;
        }

        this.#closeController?.close();
        const closeController = new CloseController();
        this.#closeController = closeController;
        const { signal } = closeController;
        this.#entry = entry;
        this.#fileSystem = fileSystem;
        this.#viewerState = viewerState;
        this.#update(() => ({ ...initialState, viewerState }));

        this.#initialize({ entry, fileSystem, viewerState, signal });
    }

    openItem(params: OpenItemParams): void {
        const fileSystem = this.#fileSystem;
        if (fileSystem === null)
            return;

        const { itemId } = params;
        const item = this.state.current.items.find(({ id }) => id === itemId);
        if (item == null)
            return;

        const { entry } = item;
        const historyItem = new HistoryItem({ entry, fileSystem });
        this.#historyController.navigate(historyItem);
    }

    openRandomItem(): void {
        const fileSystem = this.#fileSystem;
        if (fileSystem === null)
            return;

        const { items } = this.#restate.state.current;
        if (items.length === 0)
            return;

        const { entry } = items[Math.random() * items.length | 0];
        const historyItem = new HistoryItem({ entry, fileSystem });
        this.#historyController.navigate(historyItem);
    }

    toggleHiddenEntryVisible(): void {
        const entry = this.#entry;
        const fileSystem = this.#fileSystem;
        if (entry === null || fileSystem === null)
            return;

        this.#update((state) => {
            const viewerState = state.viewerState.toggleHiddenFilesVisible();
            const historyItem = new HistoryItem({ entry, fileSystem, viewerState });
            this.#historyController.replace(historyItem);
            this.#viewerState = viewerState;
            return { ...state, viewerState };
        });
    }
}
