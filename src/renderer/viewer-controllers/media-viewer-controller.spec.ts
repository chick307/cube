import { createEntryMap } from '../../common/entities/entry.test-helper';
import { DummyFileSystem } from '../../common/entities/file-system.test-helper';
import { immediate } from '../../common/utils/immediate';
import { MediaViewerState } from '../../common/values/viewer-state';
import type { EntryService } from '../services/entry-service';
import { createEntryService } from '../services/entry-service.test-helper';
import { MediaViewerControllerImpl } from './media-viewer-controller';

const entries = createEntryMap([
    '/a',
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

describe('MediaViewerControllerImpl class', () => {
    describe('imageViewerController.initialize() method', () => {
        test('it reads the file', async () => {
            const controller = new MediaViewerControllerImpl({ ...services });
            const entry = entries.get('/a')!;
            const viewerState = new MediaViewerState();
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
            const controller = new MediaViewerControllerImpl({ ...services });
            const entry = entries.get('/a')!;
            const viewerState = new MediaViewerState();
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
