import { shell } from 'electron';

import { createEntryMap } from '../../common/entities/entry.test-helper';
import { DummyFileSystem } from '../../common/entities/file-system.test-helper';
import { HistoryItem } from '../../common/entities/history-item';
import { Closed, CloseSignal } from '../../common/utils/close-controller';
import { immediate } from '../../common/utils/immediate';
import { EntryPath } from '../../common/values/entry-path';
import { Point } from '../../common/values/point';
import { MarkdownViewerState } from '../../common/values/viewer-state';
import type { HistoryController } from '../controllers/history-controller';
import { createHistoryController } from '../controllers/history-controller.test-helper';
import type { TabController } from '../controllers/tab-controller';
import { createTabController } from '../controllers/tab-controller.test-helper';
import type { EntryService } from '../services/entry-service';
import { createEntryService } from '../services/entry-service.test-helper';
import { ImageService } from '../services/image-service';
import { createImageService } from '../services/image-service.test-helper';
import { MarkdownViewerControllerImpl, MarkdownViewerControllerState } from './markdown-viewer-controller';

const entries = createEntryMap([
    '/a.md',
    '/b.md',
    '/images/',
    '/images/a',
]);

const fileSystem = new DummyFileSystem();

let services: {
    entryService: EntryService;
    historyController: HistoryController;
    imageService: ImageService;
    tabController: TabController;
};

beforeEach(() => {
    const { entryService } = createEntryService();

    const createEntryFromPath = jest.spyOn(entryService, 'createEntryFromPath');
    createEntryFromPath.mockImplementation(async (params) => {
        if (params.fileSystem !== fileSystem)
            throw Error();
        const entry = entries.get(params.entryPath.toString());
        return entry ?? null;
    });

    const readFile = jest.spyOn(entryService, 'readFile');
    readFile.mockImplementation(async (params) => {
        if (params.fileSystem !== fileSystem)
            throw Error();
        if (params.entry.path.toString() === '/a.md')
            return Buffer.from('# a.md');
        if (params.entry.path.toString() === '/b.md')
            return Buffer.from('# b.md');
        throw Error();
    });

    const { historyController } = createHistoryController();

    const { imageService } = createImageService();
    const loadBlob = jest.spyOn(imageService, 'loadBlob');
    loadBlob.mockImplementation(async (params) => {
        if (params.fileSystem !== fileSystem)
            throw Error();
        if (params.entryPath.toString() === '/images/a')
            return new Blob([Buffer.from([0])]);
        throw Error();
    });

    const { tabController } = createTabController();

    services = {
        entryService,
        historyController,
        imageService,
        tabController,
    };
});

afterEach(() => {
    services = null!;

    jest.clearAllMocks();
});

const defaultState: MarkdownViewerControllerState = {
    scrollPosition: new Point(0, 0),
    tree: null,
};

describe('MarkdownViewerControllerImpl class', () => {
    describe('markdownViewerController.initialize() method', () => {
        test('it parse the markdown', async () => {
            const readFile = jest.spyOn(services.entryService, 'readFile');
            readFile.mockReturnValue(Promise.resolve(Buffer.from('# a.md')));
            const controller = new MarkdownViewerControllerImpl({ ...services });
            const entry = entries.get('/a.md')!;
            const viewerState = new MarkdownViewerState();
            controller.initialize({ entry, fileSystem, viewerState });
            expect(controller.state.current).toEqual({ ...defaultState });
            await immediate();
            expect(readFile).toHaveBeenCalledTimes(1);
            expect(readFile).toHaveBeenCalledWith({ entry, fileSystem, signal: expect.any(CloseSignal) });
            expect(controller.state.current).toEqual({
                ...defaultState,
                tree: expect.objectContaining({
                    type: 'root',
                    children: expect.any(Array),
                }),
            });
        });

        test('it does nothing if called with the same parameters', async () => {
            const controller = new MarkdownViewerControllerImpl({ ...services });
            const entry = entries.get('/a.md')!;
            const viewerState = new MarkdownViewerState();
            controller.initialize({ entry, fileSystem, viewerState });
            expect(controller.state.current).toEqual({ ...defaultState });
            await immediate();
            controller.initialize({ entry, fileSystem, viewerState });
            expect(controller.state.current).toEqual({
                ...defaultState,
                tree: expect.any(Object),
            });
            const previousTree = controller.state.current.tree;
            await immediate();
            expect(controller.state.current).toEqual({
                ...defaultState,
                tree: previousTree,
            });
        });

        test('it updates the state of the viewer', async () => {
            const controller = new MarkdownViewerControllerImpl({ ...services });
            const entry = entries.get('/a.md')!;
            const viewerStateA = new MarkdownViewerState({ scrollPosition: new Point(0, 0) });
            const viewerStateB = new MarkdownViewerState({ scrollPosition: new Point(0, 100) });
            controller.initialize({ entry, fileSystem, viewerState: viewerStateA });
            await immediate();
            expect(controller.state.current).toEqual({
                ...defaultState,
                scrollPosition: new Point(0, 0),
                tree: expect.any(Object),
            });
            controller.initialize({ entry, fileSystem, viewerState: viewerStateB });
            await immediate();
            expect(controller.state.current).toEqual({
                ...defaultState,
                scrollPosition: new Point(0, 100),
                tree: expect.any(Object),
            });
        });
    });

    describe('markdownViewerController.isExternalLink() method', () => {
        test('it returns whether the passed link is external or not', () => {
            const controller = new MarkdownViewerControllerImpl({ ...services });
            expect(controller.isExternalLink(null)).toBe(false);
            expect(controller.isExternalLink(undefined)).toBe(false);
            expect(controller.isExternalLink('a')).toBe(false);
            expect(controller.isExternalLink('/b')).toBe(false);
            expect(controller.isExternalLink('./c')).toBe(false);
            expect(controller.isExternalLink('../d')).toBe(false);
            expect(controller.isExternalLink('file:///e')).toBe(false);
            expect(controller.isExternalLink('http://example.com')).toBe(true);
            expect(controller.isExternalLink('https://example.com/g')).toBe(true);
        });
    });

    describe('markdownViewerController.loadImage() method', () => {
        test('it loads the entry', async () => {
            const loadBlob = jest.spyOn(services.imageService, 'loadBlob');
            const controller = new MarkdownViewerControllerImpl({ ...services });
            const entry = entries.get('/a.md')!;
            const viewerState = new MarkdownViewerState();
            controller.initialize({ entry, fileSystem, viewerState });
            await immediate();
            const promise = controller.loadImage({ src: './images/a' });
            expect(loadBlob).toHaveBeenCalledTimes(1);
            expect(loadBlob).toHaveBeenCalledWith({
                entryPath: new EntryPath('/images/a'),
                fileSystem,
                signal: expect.any(CloseSignal),
            });
            await expect(promise).resolves.toBeInstanceOf(Blob);
            const blob = await promise;
            const arrayBuffer = await blob!.arrayBuffer();
            expect(Buffer.from(arrayBuffer)).toEqual(Buffer.from([0]));
        });

        test('it throws an error if entry does not exists', async () => {
            const controller = new MarkdownViewerControllerImpl({ ...services });
            const entry = entries.get('/a.md')!;
            const viewerState = new MarkdownViewerState();
            controller.initialize({ entry, fileSystem, viewerState });
            await immediate();
            const promise = controller.loadImage({ src: '/images/none' });
            await expect(promise).rejects.toThrow();
        });

        test('it returns null if source URL is not for files', async () => {
            const controller = new MarkdownViewerControllerImpl({ ...services });
            const entry = entries.get('/a.md')!;
            const viewerState = new MarkdownViewerState();
            controller.initialize({ entry, fileSystem, viewerState });
            await immediate();
            const promise = controller.loadImage({ src: 'http://localhost/a.png' });
            await expect(promise).resolves.toBe(null);
        });

        test('it returns null before initialization', async () => {
            const controller = new MarkdownViewerControllerImpl({ ...services });
            const promise = controller.loadImage({ src: '/images/a.svg' });
            await expect(promise).resolves.toBe(null);
        });
    });

    describe('markdownViewerController.openLink() method', () => {
        test('it opens the entry', async () => {
            const navigate = jest.spyOn(services.historyController, 'navigate');
            const controller = new MarkdownViewerControllerImpl({ ...services });
            const entry = entries.get('/a.md')!;
            const viewerState = new MarkdownViewerState();
            controller.initialize({ entry, fileSystem, viewerState });
            await immediate();
            controller.openLink({ href: 'b.md', inNewTab: false });
            expect(navigate).not.toHaveBeenCalled();
            await immediate();
            expect(navigate).toHaveBeenCalledTimes(1);
            expect(navigate).toHaveBeenCalledWith(new HistoryItem({ entry: entries.get('/b.md')!, fileSystem }));
        });

        test('it opens the new tab', async () => {
            const addTab = jest.spyOn(services.tabController, 'addTab');
            const controller = new MarkdownViewerControllerImpl({ ...services });
            const entry = entries.get('/a.md')!;
            const viewerState = new MarkdownViewerState();
            controller.initialize({ entry, fileSystem, viewerState });
            await immediate();
            controller.openLink({ href: 'b.md', inNewTab: true });
            expect(addTab).not.toHaveBeenCalled();
            await immediate();
            expect(addTab).toHaveBeenCalledTimes(1);
            expect(addTab).toHaveBeenCalledWith({
                active: true,
                historyItem: new HistoryItem({ entry: entries.get('/b.md')!, fileSystem }),
            });
        });

        test('it opens the URL', async () => {
            const openExternal = jest.spyOn(shell, 'openExternal');
            const controller = new MarkdownViewerControllerImpl({ ...services });
            const entry = entries.get('/a.md')!;
            const viewerState = new MarkdownViewerState();
            controller.initialize({ entry, fileSystem, viewerState });
            await immediate();
            controller.openLink({ href: 'http://example.com', inNewTab: true });
            expect(openExternal).toHaveBeenCalledTimes(1);
            expect(openExternal).toHaveBeenCalledWith('http://example.com');
            openExternal.mockClear();
            controller.openLink({ href: 'https://example.com', inNewTab: true });
            expect(openExternal).toHaveBeenCalledTimes(1);
            expect(openExternal).toHaveBeenCalledWith('https://example.com');
            openExternal.mockClear();
            controller.openLink({ href: 'myapp:custom-url', inNewTab: true });
            expect(openExternal).toHaveBeenCalledTimes(1);
            expect(openExternal).toHaveBeenCalledWith('myapp:custom-url');
        });

        test('it does nothing before initialization', async () => {
            const openExternal = jest.spyOn(shell, 'openExternal');
            const navigate = jest.spyOn(services.historyController, 'navigate');
            const addTab = jest.spyOn(services.tabController, 'addTab');
            const controller = new MarkdownViewerControllerImpl({ ...services });
            controller.openLink({ href: '/b.md', inNewTab: false });
            await immediate();
            expect(openExternal).not.toHaveBeenCalled();
            expect(navigate).not.toHaveBeenCalled();
            expect(addTab).not.toHaveBeenCalled();
        });

        test('it does nothing if no entry is found', async () => {
            const openExternal = jest.spyOn(shell, 'openExternal');
            const navigate = jest.spyOn(services.historyController, 'navigate');
            const addTab = jest.spyOn(services.tabController, 'addTab');
            const controller = new MarkdownViewerControllerImpl({ ...services });
            const entry = entries.get('/a.md')!;
            const viewerState = new MarkdownViewerState();
            controller.initialize({ entry, fileSystem, viewerState });
            await immediate();
            controller.openLink({ href: 'path/to/none', inNewTab: false });
            await immediate();
            expect(openExternal).not.toHaveBeenCalled();
            expect(navigate).not.toHaveBeenCalled();
            expect(addTab).not.toHaveBeenCalled();
        });

        test('it does nothing if the controller is re-initialized while opening the link', async () => {
            const createEntryFromPath = jest.spyOn(services.entryService, 'createEntryFromPath');
            let deferred: any;
            let createEntryFromPathParams: any;
            createEntryFromPath.mockImplementation((params) => new Promise<any>((resolve, reject) => {
                createEntryFromPathParams = params;
                deferred = { resolve, reject };
            }));
            const openExternal = jest.spyOn(shell, 'openExternal');
            const navigate = jest.spyOn(services.historyController, 'navigate');
            const addTab = jest.spyOn(services.tabController, 'addTab');
            const controller = new MarkdownViewerControllerImpl({ ...services });
            const entryA = entries.get('/a.md')!;
            const entryB = entries.get('/b.md')!;
            const viewerState = new MarkdownViewerState();
            controller.initialize({ entry: entryA, fileSystem, viewerState });
            await immediate();
            controller.openLink({ href: '/b.md', inNewTab: false });
            controller.initialize({ entry: entryB, fileSystem, viewerState });
            await immediate();
            expect(openExternal).not.toHaveBeenCalled();
            expect(navigate).not.toHaveBeenCalled();
            expect(addTab).not.toHaveBeenCalled();
            expect(createEntryFromPathParams.signal?.closed).toBe(true);
            deferred.reject(new Closed());
            await immediate();
        });
    });

    describe('markdownViewerController.scrollTo() method', () => {
        test('it replaces the history item', async () => {
            const replace = jest.spyOn(services.historyController, 'replace');
            const controller = new MarkdownViewerControllerImpl({ ...services });
            const entry = entries.get('/a.md')!;
            const viewerStateA = new MarkdownViewerState();
            controller.initialize({ entry, fileSystem, viewerState: viewerStateA });
            await immediate();
            expect(replace).not.toHaveBeenCalled();
            controller.scrollTo({ position: new Point(100, 200) });
            const viewerStateB = new MarkdownViewerState({ scrollPosition: new Point(100, 200) });
            expect(replace).toHaveBeenCalledTimes(1);
            expect(replace).toHaveBeenCalledWith(new HistoryItem({ entry, fileSystem, viewerState: viewerStateB }));
        });

        test('it does nothing if the passed position is the same as the current position', async () => {
            const replace = jest.spyOn(services.historyController, 'replace');
            const controller = new MarkdownViewerControllerImpl({ ...services });
            const entry = entries.get('/a.md')!;
            const viewerState = new MarkdownViewerState({ scrollPosition: new Point(0, 0) });
            controller.initialize({ entry, fileSystem, viewerState });
            await immediate();
            expect(replace).not.toHaveBeenCalled();
            controller.scrollTo({ position: new Point(0, 0) });
            expect(replace).not.toHaveBeenCalled();
        });

        test('it does nothing before initialization', async () => {
            const replace = jest.spyOn(services.historyController, 'replace');
            const controller = new MarkdownViewerControllerImpl({ ...services });
            controller.scrollTo({ position: new Point(100, 200) });
            expect(replace).not.toHaveBeenCalled();
        });
    });
});
