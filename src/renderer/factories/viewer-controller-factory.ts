import type { HistoryController } from '../controllers/history-controller';
import type { TabController } from '../controllers/tab-controller';
import type { EntryService } from '../services/entry-service';
import {
    DirectoryViewerController,
    DirectoryViewerControllerImpl,
} from '../viewer-controllers/directory-viewer-controller';
import {
    MarkdownViewerController,
    MarkdownViewerControllerImpl,
} from '../viewer-controllers/markdown-viewer-controller';
import {
    SymbolicLinkViewerController,
    SymbolicLinkViewerControllerImpl,
} from '../viewer-controllers/symbolic-link-viewer-controller';

export type DirectoryViewerControllerFactory = {
    createDirectoryViewerController(params: CreateDirectoryViewerControllerParams): DirectoryViewerController;
};

export type CreateDirectoryViewerControllerParams = {
    historyController: HistoryController;
};

export type MarkdownViewerControllerFactory = {
    createMarkdownViewerController(params: CreateMarkdownViewerControllerParams): MarkdownViewerController;
};

export type CreateMarkdownViewerControllerParams = {
    historyController: HistoryController;
    tabController: TabController;
};

export type SymbolicLinkViewerControllerFactory = {
    createSymbolicLinkViewerController(params: CreateSymbolicLinkViewerControllerParams): SymbolicLinkViewerController;
};

export type CreateSymbolicLinkViewerControllerParams = {
    historyController: HistoryController;
};

export class ViewerControllerFactoryImpl implements
    DirectoryViewerControllerFactory,
    MarkdownViewerControllerFactory,
    SymbolicLinkViewerControllerFactory {
    #entryService: EntryService;

    constructor(params: {
        readonly entryService: EntryService;
    }) {
        this.#entryService = params.entryService;
    }

    createDirectoryViewerController(params: CreateDirectoryViewerControllerParams): DirectoryViewerController {
        return new DirectoryViewerControllerImpl({
            entryService: this.#entryService,
            historyController: params.historyController,
        });
    }

    createMarkdownViewerController(params: CreateMarkdownViewerControllerParams): MarkdownViewerController {
        return new MarkdownViewerControllerImpl({
            entryService: this.#entryService,
            historyController: params.historyController,
            tabController: params.tabController,
        });
    }

    createSymbolicLinkViewerController(params: CreateSymbolicLinkViewerControllerParams): SymbolicLinkViewerController {
        return new SymbolicLinkViewerControllerImpl({
            entryService: this.#entryService,
            historyController: params.historyController,
        });
    }
}
