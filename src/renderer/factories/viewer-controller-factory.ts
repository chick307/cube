import type { HistoryController } from '../controllers/history-controller';
import type { TabController } from '../controllers/tab-controller';
import type { EntryService } from '../services/entry-service';
import type { ImageService } from '../services/image-service';
import { ComicViewerController, ComicViewerControllerImpl } from '../viewer-controllers/comic-viewer-controller';
import {
    DirectoryViewerController,
    DirectoryViewerControllerImpl,
} from '../viewer-controllers/directory-viewer-controller';
import { ImageViewerController, ImageViewerControllerImpl } from '../viewer-controllers/image-viewer-controller';
import {
    MarkdownViewerController,
    MarkdownViewerControllerImpl,
} from '../viewer-controllers/markdown-viewer-controller';
import { PdfViewerController, PdfViewerControllerImpl } from '../viewer-controllers/pdf-viewer-controller';
import {
    SymbolicLinkViewerController,
    SymbolicLinkViewerControllerImpl,
} from '../viewer-controllers/symbolic-link-viewer-controller';
import { TsvViewerController, TsvViewerControllerImpl } from '../viewer-controllers/tsv-viewer-controller';

export type ComicViewerControllerFactory = {
    createComicViewerController(params: CreateComicViewerControllerParams): ComicViewerController;
};

export type CreateComicViewerControllerParams = {
    historyController: HistoryController;
};

export type DirectoryViewerControllerFactory = {
    createDirectoryViewerController(params: CreateDirectoryViewerControllerParams): DirectoryViewerController;
};

export type CreateDirectoryViewerControllerParams = {
    historyController: HistoryController;
};

export type ImageViewerControllerFactory = {
    createImageViewerController(): ImageViewerController;
};

export type MarkdownViewerControllerFactory = {
    createMarkdownViewerController(params: CreateMarkdownViewerControllerParams): MarkdownViewerController;
};

export type CreateMarkdownViewerControllerParams = {
    historyController: HistoryController;
    tabController: TabController;
};

export type PdfViewerControllerFactory = {
    createPdfViewerController(params: CreatePdfViewerControllerParams): PdfViewerController;
};

export type CreatePdfViewerControllerParams = {
    historyController: HistoryController;
};

export type SymbolicLinkViewerControllerFactory = {
    createSymbolicLinkViewerController(params: CreateSymbolicLinkViewerControllerParams): SymbolicLinkViewerController;
};

export type CreateSymbolicLinkViewerControllerParams = {
    historyController: HistoryController;
};

export type TsvViewerControllerFactory = {
    createTsvViewerController(): TsvViewerController;
};

export class ViewerControllerFactoryImpl implements
    ComicViewerControllerFactory,
    DirectoryViewerControllerFactory,
    ImageViewerControllerFactory,
    MarkdownViewerControllerFactory,
    PdfViewerControllerFactory,
    SymbolicLinkViewerControllerFactory,
    TsvViewerControllerFactory {
    #entryService: EntryService;

    #imageService: ImageService;

    constructor(params: {
        readonly entryService: EntryService;

        readonly imageService: ImageService;
    }) {
        this.#entryService = params.entryService;
        this.#imageService = params.imageService;
    }

    createComicViewerController(params: CreateComicViewerControllerParams): ComicViewerController {
        return new ComicViewerControllerImpl({
            entryService: this.#entryService,
            historyController: params.historyController,
            imageService: this.#imageService,
        });
    }

    createDirectoryViewerController(params: CreateDirectoryViewerControllerParams): DirectoryViewerController {
        return new DirectoryViewerControllerImpl({
            entryService: this.#entryService,
            historyController: params.historyController,
        });
    }

    createImageViewerController(): ImageViewerController {
        return new ImageViewerControllerImpl({
            imageService: this.#imageService,
        });
    }

    createMarkdownViewerController(params: CreateMarkdownViewerControllerParams): MarkdownViewerController {
        return new MarkdownViewerControllerImpl({
            entryService: this.#entryService,
            historyController: params.historyController,
            imageService: this.#imageService,
            tabController: params.tabController,
        });
    }

    createPdfViewerController(params: CreatePdfViewerControllerParams): PdfViewerController {
        return new PdfViewerControllerImpl({
            entryService: this.#entryService,
            historyController: params.historyController,
        });
    }

    createSymbolicLinkViewerController(params: CreateSymbolicLinkViewerControllerParams): SymbolicLinkViewerController {
        return new SymbolicLinkViewerControllerImpl({
            entryService: this.#entryService,
            historyController: params.historyController,
        });
    }

    createTsvViewerController(): TsvViewerController {
        return new TsvViewerControllerImpl({
            entryService: this.#entryService,
        });
    }
}
