import { createEntryMap } from '../../common/entities/entry.test-helper';
import { DummyFileSystem } from '../../common/entities/file-system.test-helper';
import { immediate } from '../../common/utils/immediate';
import { ImageViewerState } from '../../common/values/viewer-state';
import type { EntryService } from '../services/entry-service';
import { createEntryService } from '../services/entry-service.test-helper';
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
    entryService: EntryService;
};

beforeEach(() => {
    const { entryService } = createEntryService();
    const entryServiceReadFile = jest.spyOn(entryService, 'readFile');
    entryServiceReadFile.mockImplementation(async (params) => {
        if (params.fileSystem !== fileSystem)
            throw Error();
        switch (params.entry.path.toString()) {
            case '/a': return Buffer.from([0]);
            case '/a.gif': return Buffer.from([1]);
            case '/a.jpeg': return Buffer.from([2]);
            case '/a.jpg': return Buffer.from([3]);
            case '/a.png': return Buffer.from([4]);
            case '/a.svg': return Buffer.from('<svg />');
            case '/a.webp': return Buffer.from([6]);
            default: throw Error();
        }
    });

    services = {
        entryService,
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
            const entry = entries.get('/a.png')!;
            const viewerState = new ImageViewerState();
            controller.initialize({ entry, fileSystem, viewerState });
            expect(controller.state.current).toEqual({ ...defaultState });
            await immediate();
            expect(controller.state.current).toEqual({
                ...defaultState,
                blob: expect.any(Blob),
            });
            expect(Buffer.from(await controller.state.current.blob!.arrayBuffer())).toEqual(Buffer.from([4]));
        });

        test('it initializes the blob with the appropriate media type', async () => {
            const controller = new ImageViewerControllerImpl({ ...services });
            const viewerState = new ImageViewerState();
            for (const { path, mediaType } of [
                { path: '/a', mediaType: '' },
                { path: '/a.gif', mediaType: 'image/gif' },
                { path: '/a.jpeg', mediaType: 'image/jpeg' },
                { path: '/a.jpg', mediaType: 'image/jpeg' },
                { path: '/a.png', mediaType: 'image/png' },
                { path: '/a.svg', mediaType: 'image/svg+xml' },
                { path: '/a.webp', mediaType: 'image/webp' },
            ]) {
                const entry = entries.get(path)!;
                controller.initialize({ entry, fileSystem, viewerState });
                await immediate();
                expect(controller.state.current).toMatchObject({ blob: expect.any(Blob) });
                expect(controller.state.current.blob).toMatchObject({ type: mediaType });
            }
        });

        test('it does nothing if called with the same parameters', async () => {
            const controller = new ImageViewerControllerImpl({ ...services });
            const entry = entries.get('/a.png')!;
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
            expect(Buffer.from(await controller.state.current.blob!.arrayBuffer())).toEqual(Buffer.from([4]));
        });
    });
});
