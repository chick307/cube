import { createHistoryController } from '../controllers/history-controller.test-helper';
import { createEntryService } from '../services/entry-service.test-helper';
import { DirectoryViewerControllerImpl } from '../viewer-controllers/directory-viewer-controller';
import {
    DirectoryViewerControllerFactory,
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
});
