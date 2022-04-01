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
import { MediaViewerController, MediaViewerControllerImpl } from '../viewer-controllers/media-viewer-controller';
import { PdfViewerController, PdfViewerControllerImpl } from '../viewer-controllers/pdf-viewer-controller';
import {
    SymbolicLinkViewerController,
    SymbolicLinkViewerControllerImpl,
} from '../viewer-controllers/symbolic-link-viewer-controller';
import { TextViewerController, TextViewerControllerImpl } from '../viewer-controllers/text-viewer-controller';
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
    createImageViewerController(params: CreateImageViewerControllerParams): ImageViewerController;
};

export type CreateImageViewerControllerParams = {
    historyController: HistoryController;
};

export type MarkdownViewerControllerFactory = {
    createMarkdownViewerController(params: CreateMarkdownViewerControllerParams): MarkdownViewerController;
};

export type MediaViewerControllerFactory = {
    createMediaViewerController(): MediaViewerController;
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

export type TextViewerControllerFactory = {
    createTextViewerController(params: CreateTextViewerControllerParams): TextViewerController;
};

export type CreateTextViewerControllerParams = {
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
    MediaViewerControllerFactory,
    PdfViewerControllerFactory,
    SymbolicLinkViewerControllerFactory,
    TextViewerControllerFactory,
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

    createImageViewerController(params: CreateImageViewerControllerParams): ImageViewerController {
        return new ImageViewerControllerImpl({
            historyController: params.historyController,
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

    createMediaViewerController(): MediaViewerController {
        return new MediaViewerControllerImpl({
            entryService: this.#entryService,
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

    createTextViewerController(params: CreateTextViewerControllerParams): TextViewerController {
        return new TextViewerControllerImpl({
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
