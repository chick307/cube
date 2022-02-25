import type { Entry, FileEntry } from '../../common/entities/entry';
import type { FileSystem } from '../../common/entities/file-system';
import { CloseController, CloseSignal } from '../../common/utils/close-controller';
import { Restate, State } from '../../common/utils/restate';
import { EntryPath } from '../../common/values/entry-path';
import { ImageViewerState } from '../../common/values/viewer-state';
import type { EntryService } from '../services/entry-service';

export type ImageViewerController = {
    readonly state: State<ImageViewerControllerState>;

    initialize(params: InitializeParams): void;
};

export type ImageViewerControllerState = {
    readonly blob: Blob | null;
};

export type InitializeParams = {
    readonly entry: Entry;

    readonly fileSystem: FileSystem;

    readonly viewerState: ImageViewerState;
};

type InternalState = {
    readonly blob: Blob | null;

    readonly viewerState: ImageViewerState;
};

const defaultViewerState = new ImageViewerState();

const initialState: InternalState = {
    blob: null,
    viewerState: defaultViewerState,
};

export class ImageViewerControllerImpl implements ImageViewerController {
    #closeController: CloseController | null;

    #entry: Entry | null;

    #entryService: EntryService;

    #fileSystem: FileSystem | null;

    #restate: Restate<InternalState>;

    #state: State<ImageViewerControllerState>;

    #viewerState: ImageViewerState | null;

    constructor(params: {
        readonly entryService: EntryService;
    }) {
        this.#entryService = params.entryService;

        this.#closeController = null;
        this.#entry = null;
        this.#fileSystem = null;
        this.#viewerState = null;

        this.#restate = new Restate<InternalState>(initialState);

        this.#state = this.#restate.state.map((state) => {
            const { blob } = state;
            return {
                blob,
            };
        });
    }

    get state(): State<ImageViewerControllerState> {
        return this.#state;
    }

    #getMediaType(entryPath: EntryPath): string | undefined {
        const extension = entryPath.getExtension().toLowerCase();
        switch (extension) {
            case '.jpg': case '.jpeg': return 'image/jpeg';
            case '.png': return 'image/png';
            case '.gif': return 'image/gif';
            case '.webp': return 'image/webp';
            case '.svg': return 'image/svg+xml';
            default: return undefined;
        }
    }

    async #initialize(params: {
        entry: Entry;
        fileSystem: FileSystem;
        signal: CloseSignal;
        viewerState: ImageViewerState;
    }): Promise<void> {
        const { fileSystem, signal } = params;
        const entry = params.entry as FileEntry;
        const buffer = await this.#entryService.readFile({ entry, fileSystem, signal });
        const type = this.#getMediaType(entry.path);
        const blob = new Blob([buffer], { type });
        this.#update((state) => ({ ...state, blob }));
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
        this.#update(() => ({ ...initialState, viewerState }));

        this.#initialize({ entry, fileSystem, viewerState, signal });
    }
}
