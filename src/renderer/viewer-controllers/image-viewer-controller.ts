import type { Entry, FileEntry } from '../../common/entities/entry';
import type { FileSystem } from '../../common/entities/file-system';
import { HistoryItem } from '../../common/entities/history-item';
import { CloseController, CloseSignal } from '../../common/utils/close-controller';
import { Restate, State } from '../../common/utils/restate';
import { Point } from '../../common/values/point';
import { ImageViewerState } from '../../common/values/viewer-state';
import { HistoryController } from '../controllers/history-controller';
import type { ImageService } from '../services/image-service';

export type ImageViewerController = {
    readonly state: State<ImageViewerControllerState>;

    initialize(params: InitializeParams): void;

    scrollTo(params: ScrollToParams): void;
};

export type ImageViewerControllerState = {
    readonly blob: Blob | null;

    readonly scrollPosition: Point;
};

export type InitializeParams = {
    readonly entry: Entry;

    readonly fileSystem: FileSystem;

    readonly viewerState: ImageViewerState;
};

export type ScrollToParams = {
    readonly position: Point;
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

    #fileSystem: FileSystem | null;

    #historyController: HistoryController;

    #imageService: ImageService;

    #restate: Restate<InternalState>;

    #state: State<ImageViewerControllerState>;

    #viewerState: ImageViewerState | null;

    constructor(params: {
        readonly historyController: HistoryController;
        readonly imageService: ImageService;
    }) {
        this.#historyController = params.historyController;
        this.#imageService = params.imageService;

        this.#closeController = null;
        this.#entry = null;
        this.#fileSystem = null;
        this.#viewerState = null;

        this.#restate = new Restate<InternalState>(initialState);

        this.#state = this.#restate.state.map((state) => {
            const { blob, viewerState } = state;
            const { scrollPosition } = viewerState;
            return {
                blob,
                scrollPosition,
            };
        });
    }

    get state(): State<ImageViewerControllerState> {
        return this.#state;
    }

    async #initialize(params: {
        entry: Entry;
        fileSystem: FileSystem;
        signal: CloseSignal;
        viewerState: ImageViewerState;
    }): Promise<void> {
        const { fileSystem, signal } = params;
        const entry = params.entry as FileEntry;
        const blob = await this.#imageService.loadBlob({ entryPath: entry.path, fileSystem, signal });
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

    scrollTo(params: ScrollToParams): void {
        const entry = this.#entry;
        if (entry == null)
            return;

        const { position } = params;
        const imageViewerState = this.#viewerState as ImageViewerState;
        if (imageViewerState.scrollPosition.equals(position))
            return;
        const fileSystem = this.#fileSystem as FileSystem;
        const viewerState = imageViewerState.setScrollPosition(position);
        this.#viewerState = viewerState;
        const historyItem = new HistoryItem({ entry, fileSystem, viewerState });
        this.#historyController.replace(historyItem);
    }
}
