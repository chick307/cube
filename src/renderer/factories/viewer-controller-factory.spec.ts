import { createHistoryController } from '../controllers/history-controller.test-helper';
import { createTabController } from '../controllers/tab-controller.test-helper';
import { createEntryService } from '../services/entry-service.test-helper';
import { createImageService } from '../services/image-service.test-helper';
import { ComicViewerControllerImpl } from '../viewer-controllers/comic-viewer-controller';
import { DirectoryViewerControllerImpl } from '../viewer-controllers/directory-viewer-controller';
import { ImageViewerControllerImpl } from '../viewer-controllers/image-viewer-controller';
import { MarkdownViewerControllerImpl } from '../viewer-controllers/markdown-viewer-controller';
import { MediaViewerControllerImpl } from '../viewer-controllers/media-viewer-controller';
import { PdfViewerControllerImpl } from '../viewer-controllers/pdf-viewer-controller';
import { SymbolicLinkViewerControllerImpl } from '../viewer-controllers/symbolic-link-viewer-controller';
import { TsvViewerControllerImpl } from '../viewer-controllers/tsv-viewer-controller';
import {
    ComicViewerControllerFactory,
    DirectoryViewerControllerFactory,
    ImageViewerControllerFactory,
    MarkdownViewerControllerFactory,
    MediaViewerControllerFactory,
    PdfViewerControllerFactory,
    SymbolicLinkViewerControllerFactory,
    TsvViewerControllerFactory,
    ViewerControllerFactoryImpl,
} from './viewer-controller-factory';

const createViewerControllerFactory = () => {
    const { entryService } = createEntryService();

    const { imageService } = createImageService();

    const viewerControllerFactory = new ViewerControllerFactoryImpl({
        entryService,
        imageService,
    });

    return { entryService, viewerControllerFactory };
};

describe('ViewerControllerFactoryImpl class', () => {
    describe('comicViewerControllerFactory.createComicViewerController() method', () => {
        test('it creates an instance of `ComicViewerControllerImpl` class', () => {
            const { historyController } = createHistoryController();
            const viewerControllerFactory: ComicViewerControllerFactory =
                createViewerControllerFactory().viewerControllerFactory;
            const viewerController = viewerControllerFactory.createComicViewerController({ historyController });
            expect(viewerController).toBeInstanceOf(ComicViewerControllerImpl);
        });
    });

    describe('directoryViewerControllerFactory.createDirectoryViewerController() method', () => {
        test('it creates an instance of `DirectoryViewerControllerImpl` class', () => {
            const { historyController } = createHistoryController();
            const viewerControllerFactory: DirectoryViewerControllerFactory =
                createViewerControllerFactory().viewerControllerFactory;
            const viewerController = viewerControllerFactory.createDirectoryViewerController({ historyController });
            expect(viewerController).toBeInstanceOf(DirectoryViewerControllerImpl);
        });
    });

    describe('imageViewerControllerFactory.createImageViewerController() method', () => {
        test('it creates an instance of `ImageViewerControllerImpl` class', () => {
            const viewerControllerFactory: ImageViewerControllerFactory =
                createViewerControllerFactory().viewerControllerFactory;
            const viewerController = viewerControllerFactory.createImageViewerController();
            expect(viewerController).toBeInstanceOf(ImageViewerControllerImpl);
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

    describe('mediaViewerControllerFactory.createMediaViewerController() method', () => {
        test('it creates an instance of `MediaViewerControllerImpl` class', () => {
            const viewerControllerFactory: MediaViewerControllerFactory =
                createViewerControllerFactory().viewerControllerFactory;
            const viewerController = viewerControllerFactory.createMediaViewerController();
            expect(viewerController).toBeInstanceOf(MediaViewerControllerImpl);
        });
    });

    describe('pdfViewerControllerFactory.createPdfViewerController() method', () => {
        test('it creates an instance of `PdfViewerControllerImpl` class', () => {
            const { historyController } = createHistoryController();
            const viewerControllerFactory: PdfViewerControllerFactory =
                createViewerControllerFactory().viewerControllerFactory;
            const viewerController =
                viewerControllerFactory.createPdfViewerController({ historyController });
            expect(viewerController).toBeInstanceOf(PdfViewerControllerImpl);
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

    describe('tsvViewerControllerFactory.createTsvViewerController() method', () => {
        test('it creates an instance of `TsvViewerControllerImpl` class', () => {
            const viewerControllerFactory: TsvViewerControllerFactory =
                createViewerControllerFactory().viewerControllerFactory;
            const viewerController = viewerControllerFactory.createTsvViewerController();
            expect(viewerController).toBeInstanceOf(TsvViewerControllerImpl);
        });
    });
});
