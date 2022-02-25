import { createEntryMap } from '../../common/entities/entry.test-helper';
import { DummyFileSystem } from '../../common/entities/file-system.test-helper';
import { HistoryItem } from '../../common/entities/history-item';
import { immediate } from '../../common/utils/immediate';
import { DirectoryViewerState } from '../../common/values/viewer-state';
import type { HistoryController } from '../controllers/history-controller';
import { createHistoryController } from '../controllers/history-controller.test-helper';
import type { EntryService } from '../services/entry-service';
import { createEntryService } from '../services/entry-service.test-helper';
import { DirectoryViewerControllerImpl } from './directory-viewer-controller';

const entries = createEntryMap([
    '/a/',
    '/a/a1',
    '/a/a2/',
    '/b/',
    '/b/.b1',
    '/b/b2',
    '/empty/'
]);

const fileSystem = new DummyFileSystem();

let services: {
    entryService: EntryService;
    historyController: HistoryController;
};

beforeEach(() => {
    const { entryService } = createEntryService();

    jest.spyOn(entryService, 'readDirectory').mockImplementation(async (params) => {
        if (params.fileSystem !== fileSystem)
            throw Error();
        const prefix = `${params.entry.path.toString()}/`.replace(/^\/\/$/, '/');
        const paths = [...entries.keys()].filter((path) => path.startsWith(prefix));
        return paths.map((path) => entries.get(path)!);
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
    hiddenEntryCount: 'no items',
    hiddenEntryVisible: false,
    itemCount: 'no items',
    items: [],
    randomItemOpenable: false,
};

describe('DirectoryViewerControllerImpl class', () => {
    describe('directoryViewerController.initialize() method', () => {
        test('it reads the directory', async () => {
            const controller = new DirectoryViewerControllerImpl({ ...services });
            const entry = entries.get('/a')!;
            const viewerState = new DirectoryViewerState();
            controller.initialize({ entry, fileSystem, viewerState });
            expect(controller.state.current).toEqual({ ...defaultState });
            await immediate();
            expect(controller.state.current).toEqual({
                ...defaultState,
                itemCount: '2 items',
                items: [
                    { entry: entries.get('/a/a1'), id: '0' },
                    { entry: entries.get('/a/a2'), id: '1' },
                ],
                randomItemOpenable: true,
            });
        });

        test('it does nothing if called with the same parameters', async () => {
            const controller = new DirectoryViewerControllerImpl({ ...services });
            const entry = entries.get('/a')!;
            const viewerState = new DirectoryViewerState();
            controller.initialize({ entry, fileSystem, viewerState });
            expect(controller.state.current).toEqual({ ...defaultState });
            await immediate();
            controller.initialize({ entry, fileSystem, viewerState });
            expect(controller.state.current).toEqual({
                ...defaultState,
                itemCount: '2 items',
                items: [
                    { entry: entries.get('/a/a1'), id: '0' },
                    { entry: entries.get('/a/a2'), id: '1' },
                ],
                randomItemOpenable: true,
            });
            await immediate();
            expect(controller.state.current).toEqual({
                ...defaultState,
                itemCount: '2 items',
                items: [
                    { entry: entries.get('/a/a1'), id: '0' },
                    { entry: entries.get('/a/a2'), id: '1' },
                ],
                randomItemOpenable: true,
            });
        });

        test('it updates the state of the viewer', async () => {
            const controller = new DirectoryViewerControllerImpl({ ...services });
            const entry = entries.get('/b')!;
            const viewerStateA = new DirectoryViewerState({ hiddenEntriesVisible: false });
            const viewerStateB = new DirectoryViewerState({ hiddenEntriesVisible: true });
            controller.initialize({ entry, fileSystem, viewerState: viewerStateA });
            await immediate();
            expect(controller.state.current).toEqual({
                ...defaultState,
                hiddenEntryCount: '1 item',
                itemCount: '1 item',
                items: [
                    { entry: entries.get('/b/b2'), id: '1' },
                ],
                randomItemOpenable: true,
            });
            controller.initialize({ entry, fileSystem, viewerState: viewerStateB });
            await immediate();
            expect(controller.state.current).toEqual({
                ...defaultState,
                hiddenEntryCount: '1 item',
                hiddenEntryVisible: true,
                itemCount: '2 items',
                items: [
                    { entry: entries.get('/b/.b1'), id: '0' },
                    { entry: entries.get('/b/b2'), id: '1' },
                ],
                randomItemOpenable: true,
            });
        });
    });

    describe('directoryViewerController.openItem() method', () => {
        test('it navigates to the specified item', async () => {
            const navigate = jest.spyOn(services.historyController, 'navigate');
            const controller = new DirectoryViewerControllerImpl({ ...services });
            const entry = entries.get('/a')!;
            const viewerState = new DirectoryViewerState();
            controller.initialize({ entry, fileSystem, viewerState });
            await immediate();
            controller.openItem({ itemId: '0' });
            expect(navigate).toHaveBeenCalledTimes(1);
            expect(navigate).toHaveBeenCalledWith(new HistoryItem({ entry: entries.get('/a/a1')!, fileSystem }));
        });

        test('it does nothing before initialization', async () => {
            const navigate = jest.spyOn(services.historyController, 'navigate');
            const controller = new DirectoryViewerControllerImpl({ ...services });
            await immediate();
            controller.openItem({ itemId: '0' });
            expect(navigate).not.toHaveBeenCalled();
        });

        test('it does nothing if the specified item ID does not exist', async () => {
            const navigate = jest.spyOn(services.historyController, 'navigate');
            const controller = new DirectoryViewerControllerImpl({ ...services });
            const entry = entries.get('/a')!;
            const viewerState = new DirectoryViewerState();
            controller.initialize({ entry, fileSystem, viewerState });
            expect(controller.state.current).toEqual({ ...defaultState });
            await immediate();
            controller.openItem({ itemId: 'none' });
            expect(navigate).not.toHaveBeenCalled();
        });
    });

    describe('directoryViewerController.openRandomItem() method', () => {
        test('it navigates to the random item', async () => {
            const navigate = jest.spyOn(services.historyController, 'navigate');
            const controller = new DirectoryViewerControllerImpl({ ...services });
            const entry = entries.get('/a')!;
            const viewerState = new DirectoryViewerState();
            controller.initialize({ entry, fileSystem, viewerState });
            await immediate();
            controller.openRandomItem();
            expect(navigate).toHaveBeenCalledTimes(1);
            const historyItem = navigate.mock.calls[0][0];
            expect(historyItem).toBeInstanceOf(HistoryItem);
            expect(historyItem.fileSystem).toBe(fileSystem);
            expect([entries.get('/a/a1'), entries.get('/a/a2')].includes(historyItem.entry)).toBe(true);
        });

        test('it does nothing before initialization', async () => {
            const navigate = jest.spyOn(services.historyController, 'navigate');
            const controller = new DirectoryViewerControllerImpl({ ...services });
            await immediate();
            controller.openRandomItem();
            expect(navigate).not.toHaveBeenCalled();
        });

        test('it does nothing if there is no item in the directory', async () => {
            const navigate = jest.spyOn(services.historyController, 'navigate');
            const controller = new DirectoryViewerControllerImpl({ ...services });
            const entry = entries.get('/empty')!;
            const viewerState = new DirectoryViewerState();
            controller.initialize({ entry, fileSystem, viewerState });
            expect(controller.state.current).toEqual({ ...defaultState });
            await immediate();
            controller.openRandomItem();
            expect(navigate).not.toHaveBeenCalled();
        });
    });

    describe('directoryViewerController.toggleHiddenEntryVisible() method', () => {
        test('it updates the state of the viewer', async () => {
            const replace = jest.spyOn(services.historyController, 'replace');
            const controller = new DirectoryViewerControllerImpl({ ...services });
            const entry = entries.get('/b')!;
            const viewerStateA = new DirectoryViewerState({ hiddenEntriesVisible: false });
            const viewerStateB = new DirectoryViewerState({ hiddenEntriesVisible: true });
            controller.initialize({ entry, fileSystem, viewerState: viewerStateA });
            await immediate();
            controller.toggleHiddenEntryVisible();
            await immediate();
            expect(replace).toHaveBeenCalledTimes(1);
            expect(replace).toHaveBeenCalledWith(new HistoryItem({ entry, fileSystem, viewerState: viewerStateB }));
            expect(controller.state.current).toEqual({
                ...defaultState,
                hiddenEntryCount: '1 item',
                hiddenEntryVisible: true,
                itemCount: '2 items',
                items: [
                    { entry: entries.get('/b/.b1'), id: '0' },
                    { entry: entries.get('/b/b2'), id: '1' },
                ],
                randomItemOpenable: true,
            });
        });

        test('it does nothing before initialization', async () => {
            const replace = jest.spyOn(services.historyController, 'replace');
            const controller = new DirectoryViewerControllerImpl({ ...services });
            controller.toggleHiddenEntryVisible();
            await immediate();
            expect(replace).not.toHaveBeenCalled();
            expect(controller.state.current).toEqual({ ...defaultState });
        });
    });
});
