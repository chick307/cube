import { SymbolicLinkEntry } from '../../common/entities/entry';
import { createEntryMap } from '../../common/entities/entry.test-helper';
import { DummyFileSystem } from '../../common/entities/file-system.test-helper';
import { HistoryItem } from '../../common/entities/history-item';
import { immediate } from '../../common/utils/immediate';
import { EntryPath } from '../../common/values/entry-path';
import { SymbolicLinkViewerState } from '../../common/values/viewer-state';
import type { HistoryController } from '../controllers/history-controller';
import { createHistoryController } from '../controllers/history-controller.test-helper';
import type { EntryService } from '../services/entry-service';
import { createEntryService } from '../services/entry-service.test-helper';
import { SymbolicLinkViewerControllerImpl } from './symbolic-link-viewer-controller';

const entries = createEntryMap([
    '/a/',
    '/a/a1',
]);

entries.set('/a/a2', new SymbolicLinkEntry(new EntryPath('/a/a2')));
entries.set('/a/a3', new SymbolicLinkEntry(new EntryPath('/a/a3')));

const fileSystem = new DummyFileSystem();

let services: {
    entryService: EntryService;
    historyController: HistoryController;
};

beforeEach(() => {
    const { entryService } = createEntryService();

    jest.spyOn(entryService, 'readLink').mockImplementation(async (params) => {
        if (params.fileSystem !== fileSystem)
            throw Error();
        if (params.entry.equals(entries.get('/a/a2')))
            return { entry: entries.get('/a/a1')!, linkString: 'a1' };
        if (params.entry.equals(entries.get('/a/a3')))
            return { entry: null, linkString: 'link string' };
        throw Error();
    });

    const { historyController } = createHistoryController();

    services = {
        entryService,
        historyController,
    };
});

afterEach(() => {
    services = null!;
});

const defaultState = {
    linkString: null,
    linkedEntry: null,
};

describe('SymbolicLinkViewerControllerImpl class', () => {
    describe('symbolicLinkViewerController.initialize() method', () => {
        test('it reads the symbolic link', async () => {
            const controller = new SymbolicLinkViewerControllerImpl({ ...services });
            const entry = entries.get('/a/a2')!;
            const viewerState = new SymbolicLinkViewerState();
            controller.initialize({ entry, fileSystem, viewerState });
            expect(controller.state.current).toEqual({ ...defaultState });
            await immediate();
            expect(controller.state.current).toEqual({
                ...defaultState,
                linkString: 'a1',
                linkedEntry: entries.get('/a/a1'),
            });
        });

        test('it does nothing if called with the same parameters', async () => {
            const controller = new SymbolicLinkViewerControllerImpl({ ...services });
            const entry = entries.get('/a/a2')!;
            const viewerState = new SymbolicLinkViewerState();
            controller.initialize({ entry, fileSystem, viewerState });
            expect(controller.state.current).toEqual({ ...defaultState });
            await immediate();
            controller.initialize({ entry, fileSystem, viewerState });
            expect(controller.state.current).toEqual({
                ...defaultState,
                linkString: 'a1',
                linkedEntry: entries.get('/a/a1'),
            });
            await immediate();
            expect(controller.state.current).toEqual({
                ...defaultState,
                linkString: 'a1',
                linkedEntry: entries.get('/a/a1'),
            });
        });
    });

    describe('symbolicLinkViewerController.openLink() method', () => {
        test('it navigates to the linked entry', async () => {
            const navigate = jest.spyOn(services.historyController, 'navigate');
            const controller = new SymbolicLinkViewerControllerImpl({ ...services });
            const entry = entries.get('/a/a2')!;
            const viewerState = new SymbolicLinkViewerState();
            controller.initialize({ entry, fileSystem, viewerState });
            await immediate();
            controller.openLink();
            expect(navigate).toHaveBeenCalledTimes(1);
            expect(navigate).toHaveBeenCalledWith(new HistoryItem({ entry: entries.get('/a/a1')!, fileSystem }));
        });

        test('it does nothing before initialization', async () => {
            const navigate = jest.spyOn(services.historyController, 'navigate');
            const controller = new SymbolicLinkViewerControllerImpl({ ...services });
            await immediate();
            controller.openLink();
            expect(navigate).not.toHaveBeenCalled();
        });

        test('it does nothing if the link string is not pointing to any entry', async () => {
            const navigate = jest.spyOn(services.historyController, 'navigate');
            const controller = new SymbolicLinkViewerControllerImpl({ ...services });
            const entry = entries.get('/a/a3')!;
            const viewerState = new SymbolicLinkViewerState();
            controller.initialize({ entry, fileSystem, viewerState });
            expect(controller.state.current).toEqual({ ...defaultState });
            await immediate();
            controller.openLink();
            expect(navigate).not.toHaveBeenCalled();
        });
    });
});
