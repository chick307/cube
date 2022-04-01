import { createEntryMap } from '../../common/entities/entry.test-helper';
import { DummyFileSystem } from '../../common/entities/file-system.test-helper';
import { HistoryItem } from '../../common/entities/history-item';
import { immediate } from '../../common/utils/immediate';
import { Point } from '../../common/values/point';
import { ImageViewerState } from '../../common/values/viewer-state';
import { HistoryController } from '../controllers/history-controller';
import { createHistoryController } from '../controllers/history-controller.test-helper';
import type { ImageService } from '../services/image-service';
import { createImageService } from '../services/image-service.test-helper';
import { ImageViewerControllerImpl, ImageViewerControllerState } from './image-viewer-controller';

const entries = createEntryMap([
    '/a',
    '/a.gif',
    '/a.jpeg',
    '/a.jpg',
    '/a.png',
    '/a.svg',
    '/a.webp',
]);

const fileSystem = new DummyFileSystem();

let services: {
    historyController: HistoryController;
    imageService: ImageService;
};

beforeEach(() => {
    const { historyController } = createHistoryController();

    const { imageService } = createImageService();
    const imageServiceLoadBlob = jest.spyOn(imageService, 'loadBlob');
    imageServiceLoadBlob.mockImplementation(async (params) => {
        if (params.fileSystem !== fileSystem)
            throw Error();
        switch (params.entryPath.toString()) {
            case '/a': return new Blob([Buffer.from([0])]);
            default: throw Error();
        }
    });

    services = {
        historyController,
        imageService,
    };
});

afterEach(() => {
    services = null!;
});

const defaultState: ImageViewerControllerState = {
    blob: null,
    scrollPosition: new Point(0, 0),
};

describe('ImageViewerControllerImpl class', () => {
    describe('imageViewerController.initialize() method', () => {
        test('it reads the file', async () => {
            const controller = new ImageViewerControllerImpl({ ...services });
            const entry = entries.get('/a')!;
            const viewerState = new ImageViewerState();
            controller.initialize({ entry, fileSystem, viewerState });
            expect(controller.state.current).toEqual({ ...defaultState });
            await immediate();
            expect(controller.state.current).toEqual({
                ...defaultState,
                blob: expect.any(Blob),
            });
            expect(Buffer.from(await controller.state.current.blob!.arrayBuffer())).toEqual(Buffer.from([0]));
        });

        test('it does nothing if called with the same parameters', async () => {
            const controller = new ImageViewerControllerImpl({ ...services });
            const entry = entries.get('/a')!;
            const viewerState = new ImageViewerState();
            controller.initialize({ entry, fileSystem, viewerState });
            expect(controller.state.current).toEqual({ ...defaultState });
            await immediate();
            controller.initialize({ entry, fileSystem, viewerState });
            await immediate();
            expect(controller.state.current).toEqual({
                ...defaultState,
                blob: expect.any(Blob),
            });
            expect(Buffer.from(await controller.state.current.blob!.arrayBuffer())).toEqual(Buffer.from([0]));
        });

        test('it updates the state of the viewer', async () => {
            const controller = new ImageViewerControllerImpl({ ...services });
            const entry = entries.get('/a')!;
            const viewerStateA = new ImageViewerState({ scrollPosition: new Point(0, 0) });
            const viewerStateB = new ImageViewerState({ scrollPosition: new Point(0, 100) });
            controller.initialize({ entry, fileSystem, viewerState: viewerStateA });
            await immediate();
            expect(controller.state.current).toEqual({
                ...defaultState,
                blob: expect.any(Blob),
                scrollPosition: new Point(0, 0),
            });
            controller.initialize({ entry, fileSystem, viewerState: viewerStateB });
            await immediate();
            expect(controller.state.current).toEqual({
                ...defaultState,
                blob: expect.any(Blob),
                scrollPosition: new Point(0, 100),
            });
        });
    });

    describe('imageViewerController.scrollTo() method', () => {
        test('it replaces the history item', async () => {
            const replace = jest.spyOn(services.historyController, 'replace');
            const controller = new ImageViewerControllerImpl({ ...services });
            const entry = entries.get('/a')!;
            const viewerStateA = new ImageViewerState();
            controller.initialize({ entry, fileSystem, viewerState: viewerStateA });
            await immediate();
            expect(replace).not.toHaveBeenCalled();
            controller.scrollTo({ position: new Point(100, 200) });
            const viewerStateB = new ImageViewerState({ scrollPosition: new Point(100, 200) });
            expect(replace).toHaveBeenCalledTimes(1);
            expect(replace).toHaveBeenCalledWith(new HistoryItem({ entry, fileSystem, viewerState: viewerStateB }));
        });

        test('it does nothing if the passed position is the same as the current position', async () => {
            const replace = jest.spyOn(services.historyController, 'replace');
            const controller = new ImageViewerControllerImpl({ ...services });
            const entry = entries.get('/a')!;
            const viewerState = new ImageViewerState({ scrollPosition: new Point(0, 0) });
            controller.initialize({ entry, fileSystem, viewerState });
            await immediate();
            expect(replace).not.toHaveBeenCalled();
            controller.scrollTo({ position: new Point(0, 0) });
            expect(replace).not.toHaveBeenCalled();
        });

        test('it does nothing before initialization', async () => {
            const replace = jest.spyOn(services.historyController, 'replace');
            const controller = new ImageViewerControllerImpl({ ...services });
            controller.scrollTo({ position: new Point(100, 200) });
            expect(replace).not.toHaveBeenCalled();
        });
    });
});
