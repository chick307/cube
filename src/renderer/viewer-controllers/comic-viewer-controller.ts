import { DirectoryEntry, Entry } from '../../common/entities/entry';
import { FileSystem } from '../../common/entities/file-system';
import { HistoryItem } from '../../common/entities/history-item';
import { CloseController, Closed, CloseSignal } from '../../common/utils/close-controller';
import { Restate, State } from '../../common/utils/restate';
import { ComicViewerState } from '../../common/values/viewer-state';
import type { ComicViewerPageDisplay } from '../../common/values/viewer-state/comic-viewer-state';
import type { HistoryController } from '../controllers/history-controller';
import type { EntryService } from '../services/entry-service';
import { ImageService } from '../services/image-service';

export type ComicViewerController = {
    readonly state: State<ComicViewerControllerState>;

    initialize(params: InitializeParams): void;

    openFirstPage(): void;

    openNextPage(): void;

    openLastPage(): void;

    openLeftPage(): void;

    openPreviousPage(): void;

    openRightPage(): void;

    setPageDisplay(value: ComicViewerPageDisplay): void;
};

export type ComicViewerControllerState = {
    readonly currentSpread: ComicViewerSpread | null;

    readonly pageDisplay: ComicViewerPageDisplay;

    readonly spreads: ComicViewerSpread[];
};

export type ComicViewerSpread = {
    readonly pages: [ComicViewerPage] | [ComicViewerPage, ComicViewerPage];
};

export type ComicViewerPage = {
    readonly entry: Entry;

    readonly image: HTMLImageElement | null;
};

export type InitializeParams = {
    readonly entry: Entry;

    readonly fileSystem: FileSystem;

    readonly viewerState: ComicViewerState;
};

type InternalState = {
    readonly currentSpreadIndex: number;

    readonly pages: ComicViewerPage[];

    readonly spreads: ComicViewerSpread[];

    readonly viewerState: ComicViewerState;
};

const defaultViewerState = new ComicViewerState();

export class ComicViewerControllerImpl implements ComicViewerController {
    #closeController: CloseController | null;

    #entry: Entry | null;

    #entryService: EntryService;

    #fileSystem: FileSystem | null;

    #historyController: HistoryController;

    #imageLoadingCloseController: CloseController | null;

    #imageService: ImageService;

    #restate: Restate<InternalState>;

    #state: State<ComicViewerControllerState>;

    #viewerState: ComicViewerState | null;

    constructor(params: {
        readonly entryService: EntryService;
        readonly historyController: HistoryController;
        readonly imageService: ImageService;
    }) {
        this.#entryService = params.entryService;
        this.#historyController = params.historyController;
        this.#imageService = params.imageService;

        this.#closeController = null;
        this.#entry = null;
        this.#fileSystem = null;
        this.#imageLoadingCloseController = null;
        this.#viewerState = null;

        this.#restate = new Restate<InternalState>({
            currentSpreadIndex: 0,
            pages: [],
            spreads: [],
            viewerState: defaultViewerState,
        });

        this.#state = this.#restate.state.map<ComicViewerControllerState>((state) => {
            const { currentSpreadIndex, spreads, viewerState } = state;
            const { pageDisplay } = viewerState;
            const currentSpread = currentSpreadIndex < spreads.length ? spreads[currentSpreadIndex] : null;
            return { currentSpread, pageDisplay, spreads };
        });
    }

    get state(): State<ComicViewerControllerState> {
        return this.#state;
    }

    #constructSpreads(params: {
        pageDisplay: ComicViewerPageDisplay;
        pages: ComicViewerPage[];
    }): ComicViewerSpread[] {
        if (params.pages.length === 0)
            return [];

        if (params.pageDisplay === 'single')
            return params.pages.map<ComicViewerSpread>((page) => ({ pages: [page] }));

        const spreads: ComicViewerSpread[] = [];
        const length = Math.ceil((params.pages.length - 1) / 2) + 1;
        spreads.push({ pages: [params.pages[0]] });
        for (let i = 1; i < length; i++) {
            const pages = params.pages.slice(i * 2 - 1, i * 2 + 1) as ComicViewerSpread['pages'];
            spreads.push({ pages });
        }
        return spreads;
    }

    #loadImages(params: {
        currentSpreadIndex: number;
        fileSystem: FileSystem;
        spreads: ComicViewerSpread[];
    }): void {
        const { currentSpreadIndex, fileSystem, spreads } = params;

        this.#imageLoadingCloseController?.close();

        if (spreads.length === 0) {
            this.#imageLoadingCloseController = null;
            return;
        }

        const currentSpread = spreads[currentSpreadIndex];
        const closeController = new CloseController();
        this.#imageLoadingCloseController = closeController;
        const { signal } = closeController;
        (async () => {
            for (const page of currentSpread.pages) {
                if (page.image !== null)
                    continue;
                const { entry } = page;
                const entryPath = entry.path;
                const image = await this.#imageService.loadImage({ entryPath, fileSystem, signal });
                this.#restate.update((state) => {
                    const pages = state.pages.map((p) => p !== page ? p : { entry, image });
                    const spreads = state.spreads.map((spread, index) => {
                        if (index !== currentSpreadIndex)
                            return spread;
                        const pages =
                            spread.pages.map((p) => p !== page ? p : { entry, image }) as ComicViewerSpread['pages'];
                        return { pages };
                    });
                    return { ...state, pages, spreads };
                });
            }
            closeController.close();
            if (this.#imageLoadingCloseController === closeController)
                this.#imageLoadingCloseController = null;
        })().catch((e) => {
            if (e instanceof Closed)
                return;
            throw e;
        });
    }

    async #loadPages(params: {
        entry: DirectoryEntry;
        fileSystem: FileSystem;
        signal: CloseSignal;
    }): Promise<ComicViewerPage[]> {
        const { entry, fileSystem, signal } = params;
        signal.throwIfClosed();
        const pages: ComicViewerPage[] = [];
        const entries = await this.#entryService.readDirectory({ entry, fileSystem, signal });
        for (const entry of entries) {
            if (entry.name.startsWithDot()) {
                continue;
            } else if (entry.isDirectory()) {
                pages.push(...await this.#loadPages({ entry, fileSystem, signal }));
            } else if (/^\.(?:jpe?g|png)$/.test(entry.path.getExtension())) {
                pages.push({ entry, image: null });
            }
        }
        return pages;
    }

    async #initialize(params: {
        entry: Entry;
        fileSystem: FileSystem;
        signal: CloseSignal;
    }): Promise<void> {
        const { fileSystem, signal } = params;
        const entry = params.entry as DirectoryEntry;
        const pages = await this.#loadPages({ entry, fileSystem, signal });
        this.#updatePages((state) => ({ ...state, pages }));
    }

    #updatePages(callback: (state: InternalState) => InternalState): void {
        const fileSystem = this.#fileSystem as FileSystem; // not null after initialization started
        this.#restate.update((previousState) => {
            const state = callback(previousState);
            const { currentSpreadIndex, pages, viewerState } = state;
            const { pageDisplay } = viewerState;
            const spreads = this.#constructSpreads({ pageDisplay, pages });
            this.#loadImages({ currentSpreadIndex, fileSystem, spreads });
            return { ...state, spreads };
        });
    }

    #updateCurrentSpread(callback: (state: InternalState) => InternalState): void {
        const fileSystem = this.#fileSystem as FileSystem; // not null after initialization started
        this.#restate.update((previousState) => {
            const state = callback(previousState);
            const { currentSpreadIndex, spreads } = state;
            this.#loadImages({ currentSpreadIndex, fileSystem, spreads });
            return state;
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
                this.#updatePages((state) => ({ ...state, viewerState }));
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
        this.#updatePages(() => {
            return {
                currentSpreadIndex: 0,
                externalSpreads: [],
                pages: [],
                spreads: [],
                viewerState,
            };
        });

        this.#initialize({ entry, fileSystem, signal });
    }

    openFirstPage(): void {
        this.#updateCurrentSpread((state) => {
            const currentSpreadIndex = 0;
            return { ...state, currentSpreadIndex };
        });
    }

    openNextPage(): void {
        this.#updateCurrentSpread((state) => {
            const currentSpreadIndex = Math.max(0, Math.min(state.spreads.length - 1, state.currentSpreadIndex + 1));
            return { ...state, currentSpreadIndex };
        });
    }

    openLastPage(): void {
        this.#updateCurrentSpread((state) => {
            const currentSpreadIndex = Math.max(state.spreads.length - 1, 0);
            return { ...state, currentSpreadIndex };
        });
    }

    openLeftPage(): void {
        this.#updateCurrentSpread((state) => {
            const currentSpreadIndex = Math.max(0, Math.min(state.spreads.length - 1, state.currentSpreadIndex + 1));
            return { ...state, currentSpreadIndex };
        });
    }

    openPage(pageIndex: number): void {
        this.#updateCurrentSpread((state) => {
            const currentSpreadIndex = Math.max(0, Math.min(state.spreads.length - 1,
                state.viewerState.pageDisplay === 'single' ? pageIndex : Math.ceil(pageIndex / 2)));
            return { ...state, currentSpreadIndex };
        });
    }

    openPreviousPage(): void {
        this.#updateCurrentSpread((state) => {
            const currentSpreadIndex = Math.max(0, state.currentSpreadIndex - 1);
            return { ...state, currentSpreadIndex };
        });
    }

    openRightPage(): void {
        this.#updateCurrentSpread((state) => {
            const currentSpreadIndex = Math.max(0, state.currentSpreadIndex - 1);
            return { ...state, currentSpreadIndex };
        });
    }

    setPageDisplay(value: ComicViewerPageDisplay): void {
        const entry = this.#entry;
        const fileSystem = this.#fileSystem;
        if (entry === null || fileSystem === null)
            return;
        const comicViewerState = this.#viewerState as ComicViewerState;
        const viewerState = comicViewerState.setPageDisplay(value);
        this.#viewerState = viewerState;
        this.#updatePages((state) => {
            if (value === 'single') {
                if (state.viewerState.pageDisplay === 'two') {
                    const currentSpreadIndex = Math.max(state.currentSpreadIndex * 2 - 1, 0);
                    return { ...state, currentSpreadIndex, viewerState };
                }
            } else if (value === 'two') {
                if (state.viewerState.pageDisplay === 'single') {
                    const currentSpreadIndex = (state.currentSpreadIndex + 1) >>> 1;
                    return { ...state, currentSpreadIndex, viewerState };
                }
            }
            return { ...state, viewerState };
        });

        const newHistoryItem = new HistoryItem({ entry, fileSystem, viewerState });
        this.#historyController.replace(newHistoryItem);
    }
}
