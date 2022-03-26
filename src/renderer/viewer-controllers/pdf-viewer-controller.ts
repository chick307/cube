import * as pdfjs from 'pdfjs-dist';

import type { Entry, FileEntry } from '../../common/entities/entry';
import type { FileSystem } from '../../common/entities/file-system';
import { HistoryItem } from '../../common/entities/history-item';
import { CloseController, CloseSignal } from '../../common/utils/close-controller';
import { Restate, State } from '../../common/utils/restate';
import { Size } from '../../common/values/size';
import { PdfViewerState, PdfViewerDirection, PdfViewerPageDisplay } from '../../common/values/viewer-state';
import type { HistoryController } from '../controllers/history-controller';
import type { EntryService } from '../services/entry-service';

export type PdfViewerController = {
    readonly state: State<PdfViewerControllerState>;

    initialize(params: InitializeParams): void;

    openFirstPage(): void;

    openLastPage(): void;

    openLeftPage(): void;

    openNextPage(): void;

    openPreviousPage(): void;

    openRightPage(): void;

    renderSpread(params: RenderSpreadParams): Promise<HTMLCanvasElement | null>;

    setDirection(value: PdfViewerDirection): void;

    setPageDisplay(value: PdfViewerPageDisplay): void;
};

export type PdfViewerControllerState = {
    readonly currentPageNumbers: number[] | null;

    readonly currentSpread: PdfViewerControllerSpread | null;

    readonly direction: PdfViewerDirection;

    readonly documentDirection: PdfViewerDirection;

    readonly numberOfPages: number;

    readonly pageDisplay: PdfViewerPageDisplay;
};

export type PdfViewerControllerSpread = {
    readonly id: string;

    readonly pages: readonly [PdfViewerControllerPage] | readonly [PdfViewerControllerPage, PdfViewerControllerPage];
};

export type PdfViewerControllerPage = {
    readonly id: string;

    readonly pageNumber: number;
};

export type InitializeParams = {
    readonly entry: Entry;

    readonly fileSystem: FileSystem;

    readonly viewerState: PdfViewerState;
};

export type RenderSpreadParams = {
    readonly containerSize: Size;

    readonly signal?: CloseSignal | null | undefined;

    readonly spread: Pick<PdfViewerControllerSpread, 'id'> | null;
};

type InternalState = {
    readonly currentSpreadIndex: number;

    readonly pages: readonly PdfViewerControllerPage[];

    readonly pdfDocument: pdfjs.PDFDocumentProxy | null;

    readonly pdfPreferences: InternalPdfPreferences | null;

    readonly spreads: readonly PdfViewerControllerSpread[];

    readonly viewerState: PdfViewerState;
};

type InternalPdfPreferences = {
    direction?: PdfViewerDirection | undefined;
};

const cMapUrl = '../cmaps/';

const cMapPacked = true;

const defaultState: InternalState = {
    currentSpreadIndex: 0,
    pdfDocument: null,
    pdfPreferences: null,
    pages: [],
    spreads: [],
    viewerState: new PdfViewerState(),
};

export class PdfViewerControllerImpl implements PdfViewerController {
    #closeController: CloseController | null;

    #entry: Entry | null;

    #entryService: EntryService;

    #fileSystem: FileSystem | null;

    #historyController: HistoryController;

    #viewerState: PdfViewerState;

    #restate: Restate<InternalState>;

    #state: State<PdfViewerControllerState>;

    constructor(params: {
        readonly entryService: EntryService;
        readonly historyController: HistoryController;
    }) {
        this.#entryService = params.entryService;
        this.#historyController = params.historyController;

        this.#closeController = null;
        this.#entry = null;
        this.#fileSystem = null;
        this.#viewerState = defaultState.viewerState;

        this.#restate = new Restate({ ...defaultState });

        this.#state = this.#restate.state.map<PdfViewerControllerState>((state) => {
            const { currentSpreadIndex, pages, pdfPreferences, viewerState, spreads } = state;
            const { direction, pageDisplay } = viewerState;
            const documentDirection = pdfPreferences?.direction ?? 'L2R';
            const currentSpread = spreads[currentSpreadIndex] ?? null;
            const numberOfPages = pages.length;
            const currentPageNumbers = currentSpread?.pages.map((page) => page.pageNumber) ?? null;
            return {
                currentPageNumbers,
                currentSpread,
                direction,
                documentDirection,
                numberOfPages,
                pageDisplay,
            };
        });
    }

    get state(): State<PdfViewerControllerState> {
        return this.#state;
    }

    #createPages(params: {
        readonly pdfDocument: pdfjs.PDFDocumentProxy;
    }): PdfViewerControllerPage[] {
        const { pdfDocument } = params;
        const pages: PdfViewerControllerPage[] = [];
        for (let index = 0; index < pdfDocument.numPages; index++) {
            const id = `page-${index}`;
            const pageNumber = index + 1;
            pages.push({ id, pageNumber });
        }
        return pages;
    }

    #createSpreads(params: {
        readonly pageDisplay: PdfViewerPageDisplay;
        readonly pages: ReadonlyArray<PdfViewerControllerPage>;
    }): PdfViewerControllerSpread[] {
        const { pageDisplay } = params;
        const spreads: PdfViewerControllerSpread[] = [];
        const pageLength = params.pages.length;
        if (pageDisplay === 'single') {
            for (let index = 0; index < pageLength; index++) {
                const id = `spread-${index}-s`;
                const pages = [params.pages[index]] as const;
                spreads.push({ id, pages });
            }
        } else {
            const direction = this.#getDirection();
            const length = Math.ceil((pageLength + 1) / 2);
            for (let index = 0; index < length; index++) {
                const id = `spread-${index}-t`;
                const firstPage = index === 0 ? null : params.pages[index * 2 - 1];
                const secondPage = index * 2 < pageLength ? params.pages[index * 2] : null;
                const pages =
                    firstPage === null ? [secondPage as PdfViewerControllerPage] as const :
                    secondPage === null ? [firstPage] as const :
                    direction === 'R2L' ? [secondPage, firstPage] as const :
                    [firstPage, secondPage] as const;
                spreads.push({ id, pages });
            }
        }
        return spreads;
    }

    #getDirection(): Exclude<PdfViewerDirection, null> {
        const { pdfPreferences, viewerState } = this.#restate.state.current;
        const direction = viewerState.direction ?? pdfPreferences?.direction ?? 'L2R';
        return direction;
    }

    async #initialize(params: {
        readonly entry: Entry;
        readonly fileSystem: FileSystem;
        readonly signal: CloseSignal;
    }): Promise<void> {
        const { entry, fileSystem, signal } = params;
        const pdfDocument = await this.#loadPdfDocument({ entry, fileSystem, signal });
        await this.#loadPdfPreferences({ pdfDocument, signal });
        const pages = this.#createPages({ pdfDocument });
        this.#updateSpreads((state) => ({ ...state, pages }));
    }

    async #loadPdfDocument(params: {
        readonly entry: Entry;
        readonly fileSystem: FileSystem;
        readonly signal: CloseSignal;
    }): Promise<pdfjs.PDFDocumentProxy> {
        const { fileSystem } = params;
        const entry = params.entry as FileEntry;
        const closeController = new CloseController();
        const { signal } = closeController;
        params.signal.defer(() => closeController.close());
        const buffer = await this.#entryService.readFile({ entry, fileSystem, signal });
        const blob = new Blob([buffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        signal.defer(() => URL.revokeObjectURL(url));
        const pdfDocument = await signal.wrapPromise(pdfjs.getDocument({ url, cMapUrl, cMapPacked }).promise);
        await this.#update((state) => ({ ...state, pdfDocument }));
        return pdfDocument;
    }

    async #loadPdfPreferences(params: {
        readonly pdfDocument: pdfjs.PDFDocumentProxy;
        readonly signal: CloseSignal;
    }): Promise<InternalPdfPreferences> {
        const { pdfDocument, signal } = params;
        const pref = await signal.wrapPromise(pdfDocument.getViewerPreferences());
        const direction = pref !== null && Reflect.get(pref, 'Direction') === 'R2L' ? 'R2L' as const : 'L2R' as const;
        const pdfPreferences = { direction };
        await this.#update((state) => ({ ...state, pdfPreferences }));
        return pdfPreferences;
    }

    async #renderPdfPage(params: {
        readonly pdfPage: pdfjs.PDFPageProxy;
        readonly scale: number;
        readonly signal: CloseSignal;
    }): Promise<HTMLCanvasElement> {
        const { pdfPage, scale, signal } = params;
        const pdfViewport = pdfPage.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = pdfViewport.width;
        canvas.height = pdfViewport.height;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        const task = pdfPage.render({ canvasContext: ctx, viewport: pdfViewport });
        signal.defer(() => task.cancel());
        await signal.wrapPromise(task.promise);
        return canvas;
    }

    async #renderSpread(params: {
        readonly containerSize: Size;
        readonly pdfDocument: pdfjs.PDFDocumentProxy;
        readonly signal: CloseSignal;
        readonly spread: PdfViewerControllerSpread;
    }): Promise<HTMLCanvasElement> {
        const { containerSize, pdfDocument, signal, spread } = params;
        const { pages } = spread;
        const pdfPages = await Promise.all(pages.map(({ pageNumber }) => pdfDocument.getPage(pageNumber)));
        const pdfViewports = pdfPages.map((pdfPage) => pdfPage.getViewport({ scale: 1 }));
        const viewportSizes = pdfViewports.map((pdfViewport) => new Size(pdfViewport));
        const spreadSize = viewportSizes.reduce((a, b) => a.joinHorizontally(b));
        const canvasSize = spreadSize.scaleToFill(containerSize);
        const canvas = document.createElement('canvas');
        canvas.width = canvasSize.width;
        canvas.height = canvasSize.height;
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        let x = 0;
        for (let i = 0; i < pdfPages.length; i++) {
            const pdfPage = pdfPages[i];
            const pdfViewport = pdfViewports[i];
            const scale = canvasSize.height / pdfViewport.height;
            const imageSource = await this.#renderPdfPage({ pdfPage, scale, signal });
            context.drawImage(imageSource, x, 0);
            x += imageSource.width;
        }
        return canvas;
    }

    #update(callback: (state: InternalState) => InternalState): Promise<void> {
        return this.#restate.update((previousState) => {
            const state = callback(previousState);

            const { spreads } = state;

            const currentSpreadIndex = Math.max(0, Math.min(spreads.length - 1, state.currentSpreadIndex));

            return {
                ...state,
                currentSpreadIndex,
            };
        });
    }

    #updateSpreads(callback: (state: InternalState) => InternalState): Promise<void> {
        return this.#update((previousState) => {
            const state = callback(previousState);
            const { pages, viewerState } = state;
            const { pageDisplay } = viewerState;
            const spreads = this.#createSpreads({ pageDisplay, pages });
            return { ...state, spreads };
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
        this.#update(() => ({ ...defaultState, viewerState }));
        this.#initialize({ entry, fileSystem, signal });
    }

    openFirstPage(): void {
        this.#update((state) => {
            const currentSpreadIndex = 0;
            return { ...state, currentSpreadIndex };
        });
    }

    openLastPage(): void {
        this.#update((state) => {
            const currentSpreadIndex = Infinity;
            return { ...state, currentSpreadIndex };
        });
    }

    openLeftPage(): void {
        this.#update((state) => {
            const direction = this.#getDirection();
            const delta = direction === 'L2R' ? -1 : 1;
            const currentSpreadIndex = state.currentSpreadIndex + delta;
            return { ...state, currentSpreadIndex };
        });
    }

    openNextPage(): void {
        this.#update((state) => {
            const currentSpreadIndex = state.currentSpreadIndex + 1;
            return { ...state, currentSpreadIndex };
        });
    }

    openPreviousPage(): void {
        this.#update((state) => {
            const currentSpreadIndex = state.currentSpreadIndex - 1;
            return { ...state, currentSpreadIndex };
        });
    }

    openRightPage(): void {
        this.#update((state) => {
            const direction = this.#getDirection();
            const delta = direction === 'L2R' ? 1 : -1;
            const currentSpreadIndex = state.currentSpreadIndex + delta;
            return { ...state, currentSpreadIndex };
        });
    }

    async renderSpread(params: RenderSpreadParams): Promise<HTMLCanvasElement | null> {
        const { containerSize, signal: signalParam, spread: spreadParam } = params;
        const spreadId = spreadParam?.id ?? null;
        const { pdfDocument, spreads } = this.#restate.state.current;
        const spread = spreadId === null ? null : spreads.find((s) => s.id === spreadId);
        if (pdfDocument === null || spread == null)
            return null;

        const closeController = new CloseController();
        (this.#closeController as CloseController).signal.defer(() => closeController.close());
        signalParam?.defer(() => closeController.close());
        const { signal } = closeController;
        const source = await this.#renderSpread({ containerSize, pdfDocument, signal, spread });
        closeController.close();
        return source;
    }

    setDirection(value: PdfViewerDirection): void {
        const entry = this.#entry;
        if (entry === null)
            return;

        this.#updateSpreads((state) => {
            const fileSystem = this.#fileSystem as FileSystem;
            const viewerState = this.#viewerState.setDirection(value);
            this.#viewerState = viewerState;
            const newHistoryItem = new HistoryItem({ entry, fileSystem, viewerState });
            this.#historyController.replace(newHistoryItem);

            return { ...state, viewerState };
        });
    }

    setPageDisplay(value: PdfViewerPageDisplay): void {
        const entry = this.#entry;
        if (entry === null)
            return;

        this.#updateSpreads((state) => {
            const fileSystem = this.#fileSystem as FileSystem;
            const viewerState = this.#viewerState.setPageDisplay(value);
            this.#viewerState = viewerState;
            const newHistoryItem = new HistoryItem({ entry, fileSystem, viewerState });
            this.#historyController.replace(newHistoryItem);

            const previousPageDisplay = state.viewerState.pageDisplay;
            const previousSpreadIndex = state.currentSpreadIndex;
            const currentSpreadIndex =
                previousPageDisplay === value ? previousSpreadIndex :
                value === 'single' ? previousSpreadIndex * 2 :
                value === 'two' ? Math.floor(previousSpreadIndex / 2) :
                previousSpreadIndex;

            return { ...state, currentSpreadIndex, viewerState };
        });
    }
}
