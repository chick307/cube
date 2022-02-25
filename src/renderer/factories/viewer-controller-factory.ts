import type { HistoryController } from '../controllers/history-controller';
import type { EntryService } from '../services/entry-service';
import {
    DirectoryViewerController,
    DirectoryViewerControllerImpl,
} from '../viewer-controllers/directory-viewer-controller';
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

export type SymbolicLinkViewerControllerFactory = {
    createSymbolicLinkViewerController(params: CreateSymbolicLinkViewerControllerParams): SymbolicLinkViewerController;
};

export type CreateSymbolicLinkViewerControllerParams = {
    historyController: HistoryController;
};

export class ViewerControllerFactoryImpl implements DirectoryViewerControllerFactory {
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

    createSymbolicLinkViewerController(params: CreateSymbolicLinkViewerControllerParams): SymbolicLinkViewerController {
        return new SymbolicLinkViewerControllerImpl({
            entryService: this.#entryService,
            historyController: params.historyController,
        });
    }
}
