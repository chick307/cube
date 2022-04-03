import { createEntryMap } from '../../common/entities/entry.test-helper';
import { DummyFileSystem } from '../../common/entities/file-system.test-helper';
import { HistoryItem } from '../../common/entities/history-item';
import { CloseSignal } from '../../common/utils/close-controller';
import { immediate } from '../../common/utils/immediate';
import { Point } from '../../common/values/point';
import { BinaryViewerState } from '../../common/values/viewer-state';
import type { HistoryController } from '../controllers/history-controller';
import { createHistoryController } from '../controllers/history-controller.test-helper';
import type { EntryService } from '../services/entry-service';
import { createEntryService } from '../services/entry-service.test-helper';
import { BinaryViewerControllerImpl, BinaryViewerControllerState } from './binary-viewer-controller';

const entries = createEntryMap([
    '/a',
    '/big-file',
    '/multibyte-characters',
]);

const fileSystem = new DummyFileSystem();

let services: {
    entryService: EntryService;
    historyController: HistoryController;
};

beforeEach(() => {
    const { entryService } = createEntryService();

    const readFile = jest.spyOn(entryService, 'readFile');
    readFile.mockImplementation(async (params) => {
        if (params.fileSystem !== fileSystem)
            throw Error();
        switch (params.entry.path.toString()) {
            case '/a': return Buffer.from([0, 1, 2, 3, 4]);
            case '/big-file': return Buffer.alloc(2500);
            case '/multibyte-characters': return Buffer.from([
                0x61,
                0xC2, 0xA5,
                0xE3, 0x81, 0x82,
                0xF0, 0x9F, 0x98, 0x80,
                0x80,
                0xC2, 0xC2, 0x20,
                0xE3, 0xE3, 0xE3, 0x80, 0x20,
                0xF0, 0xF0, 0xF0, 0xF0, 0x80, 0x20,
            ]);
            default: throw Error();
        }
    });

    const { historyController } = createHistoryController();

    services = {
        entryService,
        historyController,
    };
});

afterEach(() => {
    services = null!;

    jest.clearAllMocks();
});

const defaultState: BinaryViewerControllerState = {
    blocks: null,
    buffer: null,
    scrollPosition: new Point(0, 0),
};

describe('BinaryViewerControllerImpl class', () => {
    describe('binaryViewerController.initialize() method', () => {
        test('it reads the entry', async () => {
            const readFile = jest.spyOn(services.entryService, 'readFile');
            const controller = new BinaryViewerControllerImpl({ ...services });
            const entry = entries.get('/a')!;
            const viewerState = new BinaryViewerState();
            controller.initialize({ entry, fileSystem, viewerState });
            expect(controller.state.current).toEqual({ ...defaultState });
            await immediate();
            expect(readFile).toHaveBeenCalledTimes(1);
            expect(readFile).toHaveBeenCalledWith({ entry, fileSystem, signal: expect.any(CloseSignal) });
            expect(controller.state.current).toEqual({
                ...defaultState,
                blocks: [
                    { blockEnd: 5, blockStart: 0, codePoints: [0, 1, 2, 3, 4], id: expect.any(String) },
                ],
                buffer: Buffer.from([0, 1, 2, 3, 4]),
            });
        });

        test('it splits the entry into blocks', async () => {
            const controller = new BinaryViewerControllerImpl({ ...services });
            const entry = entries.get('/big-file')!;
            const viewerState = new BinaryViewerState();
            controller.initialize({ entry, fileSystem, viewerState });
            expect(controller.state.current).toEqual({ ...defaultState });
            await immediate();
            expect(controller.state.current).toEqual({
                ...defaultState,
                blocks: expect.any(Array),
                buffer: expect.any(Buffer),
            });
            const blocks = controller.state.current.blocks!;
            expect(blocks.length).toBe(3);
            expect(blocks[0].blockStart).toBe(0);
            expect(blocks[0].blockEnd).toBe(1024);
            expect(blocks[1].blockStart).toBe(1024);
            expect(blocks[1].blockEnd).toBe(2048);
            expect(blocks[2].blockStart).toBe(2048);
            expect(blocks[2].blockEnd).toBe(2500);
        });

        test('it decodes the UTF-8 code points', async () => {
            const controller = new BinaryViewerControllerImpl({ ...services });
            const entry = entries.get('/multibyte-characters')!;
            const viewerState = new BinaryViewerState();
            controller.initialize({ entry, fileSystem, viewerState });
            expect(controller.state.current).toEqual({ ...defaultState });
            await immediate();
            expect(controller.state.current).toEqual({
                ...defaultState,
                blocks: expect.any(Array),
                buffer: expect.any(Buffer),
            });
            const blocks = controller.state.current.blocks!;
            expect(blocks.length).toBe(1);
            expect(blocks[0].codePoints).toEqual([
                0x00000061,
                0x000000A5, null,
                0x00003042, null, null,
                0x0001F600, null, null, null,
                null,
                null, null, 0x20,
                null, null, null, null, 0x20,
                null, null, null, null, null, 0x20,
            ]);
        });

        test('it does nothing if called with the same parameters', async () => {
            const controller = new BinaryViewerControllerImpl({ ...services });
            const entry = entries.get('/a')!;
            const viewerState = new BinaryViewerState();
            controller.initialize({ entry, fileSystem, viewerState });
            expect(controller.state.current).toEqual({ ...defaultState });
            await immediate();
            controller.initialize({ entry, fileSystem, viewerState });
            const expectedState = {
                ...defaultState,
                blocks: [
                    { blockEnd: 5, blockStart: 0, codePoints: [0, 1, 2, 3, 4], id: expect.any(String) },
                ],
                buffer: Buffer.from([0, 1, 2, 3, 4]),
            };
            expect(controller.state.current).toEqual(expectedState);
            await immediate();
            expect(controller.state.current).toEqual(expectedState);
        });

        test('it updates the state of the viewer', async () => {
            const controller = new BinaryViewerControllerImpl({ ...services });
            const entry = entries.get('/a')!;
            const viewerStateA = new BinaryViewerState({ scrollPosition: new Point(0, 0) });
            const viewerStateB = new BinaryViewerState({ scrollPosition: new Point(0, 100) });
            controller.initialize({ entry, fileSystem, viewerState: viewerStateA });
            await immediate();
            expect(controller.state.current).toEqual({
                ...defaultState,
                blocks: expect.any(Array),
                buffer: expect.any(Buffer),
                scrollPosition: new Point(0, 0),
            });
            controller.initialize({ entry, fileSystem, viewerState: viewerStateB });
            await immediate();
            expect(controller.state.current).toEqual({
                ...defaultState,
                blocks: expect.any(Array),
                buffer: expect.any(Buffer),
                scrollPosition: new Point(0, 100),
            });
        });
    });

    describe('binaryViewerController.scrollTo() method', () => {
        test('it replaces the history item', async () => {
            const replace = jest.spyOn(services.historyController, 'replace');
            const controller = new BinaryViewerControllerImpl({ ...services });
            const entry = entries.get('/a')!;
            const viewerStateA = new BinaryViewerState();
            controller.initialize({ entry, fileSystem, viewerState: viewerStateA });
            await immediate();
            expect(replace).not.toHaveBeenCalled();
            controller.scrollTo({ position: new Point(100, 200) });
            const viewerStateB = new BinaryViewerState({ scrollPosition: new Point(100, 200) });
            expect(replace).toHaveBeenCalledTimes(1);
            expect(replace).toHaveBeenCalledWith(new HistoryItem({ entry, fileSystem, viewerState: viewerStateB }));
        });

        test('it does nothing if the passed position is the same as the current position', async () => {
            const replace = jest.spyOn(services.historyController, 'replace');
            const controller = new BinaryViewerControllerImpl({ ...services });
            const entry = entries.get('/a')!;
            const viewerState = new BinaryViewerState({ scrollPosition: new Point(0, 0) });
            controller.initialize({ entry, fileSystem, viewerState });
            await immediate();
            expect(replace).not.toHaveBeenCalled();
            controller.scrollTo({ position: new Point(0, 0) });
            expect(replace).not.toHaveBeenCalled();
        });

        test('it does nothing before initialization', async () => {
            const replace = jest.spyOn(services.historyController, 'replace');
            const controller = new BinaryViewerControllerImpl({ ...services });
            controller.scrollTo({ position: new Point(100, 200) });
            expect(replace).not.toHaveBeenCalled();
        });
    });
});
