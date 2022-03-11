import { createEntryMap } from '../../common/entities/entry.test-helper';
import { DummyFileSystem } from '../../common/entities/file-system.test-helper';
import { immediate } from '../../common/utils/immediate';
import { ImageViewerState } from '../../common/values/viewer-state';
import type { ImageService } from '../services/image-service';
import { createImageService } from '../services/image-service.test-helper';
import { ImageViewerControllerImpl } from './image-viewer-controller';

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
    imageService: ImageService;
};

beforeEach(() => {
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
        imageService,
    };
});

afterEach(() => {
    services = null!;
});

const defaultState = {
    blob: null,
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
    });
});
