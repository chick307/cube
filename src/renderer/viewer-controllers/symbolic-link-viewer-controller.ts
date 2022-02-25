import type { Entry, SymbolicLinkEntry } from '../../common/entities/entry';
import type { FileSystem } from '../../common/entities/file-system';
import { HistoryItem } from '../../common/entities/history-item';
import { CloseController, CloseSignal } from '../../common/utils/close-controller';
import { Restate, State } from '../../common/utils/restate';
import { SymbolicLinkViewerState } from '../../common/values/viewer-state';
import { HistoryController } from '../controllers/history-controller';
import type { EntryService } from '../services/entry-service';

export type SymbolicLinkViewerController = {
    readonly state: State<SymbolicLinkViewerControllerState>;

    initialize(params: InitializeParams): void;
};

export type SymbolicLinkViewerControllerState = {
    readonly linkString: string | null;

    readonly linkedEntry: Entry | null;
};

export type InitializeParams = {
    readonly entry: Entry;

    readonly fileSystem: FileSystem;

    readonly viewerState: SymbolicLinkViewerState;
};

type InternalState = {
    readonly linkString: string | null;

    readonly linkedEntry: Entry | null;

    readonly viewerState: SymbolicLinkViewerState;
};

const defaultInternalState: InternalState = {
    linkString: null,
    linkedEntry: null,
    viewerState: new SymbolicLinkViewerState(),
};

export class SymbolicLinkViewerControllerImpl implements SymbolicLinkViewerController {
    #closeController: CloseController | null;

    #entry: Entry | null;

    #entryService: EntryService;

    #fileSystem: FileSystem | null;

    #historyController: HistoryController;

    #viewerState: SymbolicLinkViewerState;

    #restate: Restate<InternalState>;

    #state: State<SymbolicLinkViewerControllerState>;

    constructor(params: {
        readonly entryService: EntryService;

        readonly historyController: HistoryController;
    }) {
        this.#entryService = params.entryService;
        this.#historyController = params.historyController;

        this.#closeController = null;
        this.#entry = null;
        this.#fileSystem = null;
        this.#viewerState = defaultInternalState.viewerState;

        this.#restate = new Restate({ ...defaultInternalState });

        this.#state = this.#restate.state.map<SymbolicLinkViewerControllerState>((state) => {
            const { linkString, linkedEntry } = state;

            return {
                linkString,
                linkedEntry,
            };
        });
    }

    get state(): State<SymbolicLinkViewerControllerState> {
        return this.#state;
    }

    async #initialize(params: {
        entry: Entry;
        fileSystem: FileSystem;
        signal: CloseSignal;
    }): Promise<void> {
        const { fileSystem, signal } = params;
        const entry = params.entry as SymbolicLinkEntry;

        const link = await this.#entryService.readLink({ entry, fileSystem, signal });

        this.#update((state) => {
            return {
                ...state,
                linkedEntry: link.entry,
                linkString: link.linkString,
            };
        });
    }

    #update(callback: (state: InternalState) => InternalState): void {
        this.#restate.update((previousState) => {
            const state = callback(previousState);

            return {
                ...state,
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
        this.#update(() => ({ ...defaultInternalState, viewerState }));

        this.#initialize({ entry, fileSystem, signal });
    }

    openLink(): void {
        const fileSystem = this.#fileSystem;
        if (fileSystem === null)
            return;

        const entry = this.#restate.state.current.linkedEntry;
        if (entry === null)
            return;

        const historyItem = new HistoryItem({ entry, fileSystem });
        this.#historyController.navigate(historyItem);
    }
}
