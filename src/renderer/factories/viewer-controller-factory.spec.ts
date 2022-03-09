import { createHistoryController } from '../controllers/history-controller.test-helper';
import { createTabController } from '../controllers/tab-controller.test-helper';
import { createEntryService } from '../services/entry-service.test-helper';
import { DirectoryViewerControllerImpl } from '../viewer-controllers/directory-viewer-controller';
import { ImageViewerControllerImpl } from '../viewer-controllers/image-viewer-controller';
import { MarkdownViewerControllerImpl } from '../viewer-controllers/markdown-viewer-controller';
import { SymbolicLinkViewerControllerImpl } from '../viewer-controllers/symbolic-link-viewer-controller';
import {
    DirectoryViewerControllerFactory,
    ImageViewerControllerFactory,
    MarkdownViewerControllerFactory,
    SymbolicLinkViewerControllerFactory,
    ViewerControllerFactoryImpl,
} from './viewer-controller-factory';

const createViewerControllerFactory = () => {
    const { entryService } = createEntryService();
    const viewerControllerFactory = new ViewerControllerFactoryImpl({ entryService });
    return { entryService, viewerControllerFactory };
};

describe('ViewerControllerFactoryImpl class', () => {
    describe('directoryViewerControllerFactory.createDirectoryViewerController() method', () => {
        test('it creates an instance of `DirectoryViewerControllerImpl` class', () => {
            const { historyController } = createHistoryController();
            const viewerControllerFactory: DirectoryViewerControllerFactory =
                createViewerControllerFactory().viewerControllerFactory;
            const viewerController = viewerControllerFactory.createDirectoryViewerController({ historyController });
            expect(viewerController).toBeInstanceOf(DirectoryViewerControllerImpl);
        });
    });

    describe('markdownViewerControllerFactory.createMarkdownViewerController() method', () => {
        test('it creates an instance of `MarkdownViewerControllerImpl` class', () => {
            const { historyController } = createHistoryController();
            const { tabController } = createTabController();
            const viewerControllerFactory: MarkdownViewerControllerFactory =
                createViewerControllerFactory().viewerControllerFactory;
            const viewerController =
                viewerControllerFactory.createMarkdownViewerController({ historyController, tabController });
            expect(viewerController).toBeInstanceOf(MarkdownViewerControllerImpl);
        });
    });

    describe('imageViewerControllerFactory.createImageViewerController() method', () => {
        test('it creates an instance of `ImageViewerControllerImpl` class', () => {
            const viewerControllerFactory: ImageViewerControllerFactory =
                createViewerControllerFactory().viewerControllerFactory;
            const viewerController =
                viewerControllerFactory.createImageViewerController();
            expect(viewerController).toBeInstanceOf(ImageViewerControllerImpl);
        });
    });

    describe('symbolicLinkViewerControllerFactory.createSymbolicLinkViewerController() method', () => {
        test('it creates an instance of `SymbolicLinkViewerControllerImpl` class', () => {
            const { historyController } = createHistoryController();
            const viewerControllerFactory: SymbolicLinkViewerControllerFactory =
                createViewerControllerFactory().viewerControllerFactory;
            const viewerController = viewerControllerFactory.createSymbolicLinkViewerController({ historyController });
            expect(viewerController).toBeInstanceOf(SymbolicLinkViewerControllerImpl);
        });
    });
});
