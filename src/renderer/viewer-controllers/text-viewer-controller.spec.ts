import { toText } from 'hast-util-to-text';
import { h } from 'hastscript';

import { createEntryMap } from '../../common/entities/entry.test-helper';
import { DummyFileSystem } from '../../common/entities/file-system.test-helper';
import { HistoryItem } from '../../common/entities/history-item';
import { CloseSignal } from '../../common/utils/close-controller';
import { immediate } from '../../common/utils/immediate';
import { Point } from '../../common/values/point';
import { TextViewerState } from '../../common/values/viewer-state';
import type { HistoryController } from '../controllers/history-controller';
import { createHistoryController } from '../controllers/history-controller.test-helper';
import type { EntryService } from '../services/entry-service';
import { createEntryService } from '../services/entry-service.test-helper';
import { TextViewerControllerImpl, TextViewerControllerState } from './text-viewer-controller';

const entries = createEntryMap([
    '/a.txt',
    '/b.js',
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
            case '/a.txt': return Buffer.from('a.txt');
            case '/b.js': return Buffer.from('/* 1\n   2\n   3\n */\n');
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

const defaultState: TextViewerControllerState = {
    language: 'plaintext',
    scrollPosition: Point.zero,
    lines: null,
};

describe('TextViewerControllerImpl class', () => {
    describe('textViewerController.initialize() method', () => {
        test('it reads the entry', async () => {
            const readFile = jest.spyOn(services.entryService, 'readFile');
            const controller = new TextViewerControllerImpl({ ...services });
            const entry = entries.get('/a.txt')!;
            const viewerState = new TextViewerState({ language: 'javascript' });
            controller.initialize({ entry, fileSystem, viewerState });
            expect(controller.state.current).toEqual({ ...defaultState });
            await immediate();
            expect(readFile).toHaveBeenCalledTimes(1);
            expect(readFile).toHaveBeenCalledWith({ entry, fileSystem, signal: expect.any(CloseSignal) });
            expect(controller.state.current).toEqual({
                ...defaultState,
                language: 'javascript',
                lines: [
                    { lineNumber: 1, tree: expect.objectContaining({ type: 'root' }) },
                ],
            });
        });

        test('it splits the entry into lines', async () => {
            const controller = new TextViewerControllerImpl({ ...services });
            const entry = entries.get('/b.js')!;
            const viewerState = new TextViewerState();
            controller.initialize({ entry, fileSystem, viewerState });
            expect(controller.state.current).toEqual({ ...defaultState });
            await immediate();
            expect(controller.state.current).toEqual({
                ...defaultState,
                lines: expect.any(Array),
            });
            expect(controller.state.current.lines!.map(({ tree }) => toText(h('pre', tree)))).toEqual([
                '/* 1\n',
                '   2\n',
                '   3\n',
                ' */\n',
            ]);
        });

        test('it does nothing if called with the same parameters', async () => {
            const controller = new TextViewerControllerImpl({ ...services });
            const entry = entries.get('/a.txt')!;
            const viewerState = new TextViewerState();
            controller.initialize({ entry, fileSystem, viewerState });
            expect(controller.state.current).toEqual({ ...defaultState });
            await immediate();
            controller.initialize({ entry, fileSystem, viewerState });
            const expectedState = {
                ...defaultState,
                lines: [
                    { lineNumber: 1, tree: expect.objectContaining({ type: 'root' }) },
                ],
            };
            expect(controller.state.current).toEqual(expectedState);
            await immediate();
            expect(controller.state.current).toEqual(expectedState);
        });

        test('it updates the state of the viewer', async () => {
            const controller = new TextViewerControllerImpl({ ...services });
            const entry = entries.get('/a.txt')!;
            const viewerStateA = new TextViewerState({ scrollPosition: Point.zero });
            const viewerStateB = new TextViewerState({ scrollPosition: new Point(0, 100) });
            controller.initialize({ entry, fileSystem, viewerState: viewerStateA });
            await immediate();
            expect(controller.state.current).toEqual({
                ...defaultState,
                lines: expect.any(Array),
                scrollPosition: Point.zero,
            });
            controller.initialize({ entry, fileSystem, viewerState: viewerStateB });
            await immediate();
            expect(controller.state.current).toEqual({
                ...defaultState,
                lines: expect.any(Array),
                scrollPosition: new Point(0, 100),
            });
        });
    });

    describe('textViewerController.setLanguage() method', () => {
        test('it replaces the history item', async () => {
            const replace = jest.spyOn(services.historyController, 'replace');
            const controller = new TextViewerControllerImpl({ ...services });
            const entry = entries.get('/a.txt')!;
            const viewerStateA = new TextViewerState();
            controller.initialize({ entry, fileSystem, viewerState: viewerStateA });
            await immediate();
            expect(replace).not.toHaveBeenCalled();
            controller.setLanguage('javascript');
            const viewerStateB = new TextViewerState({ language: 'javascript' });
            expect(replace).toHaveBeenCalledTimes(1);
            expect(replace).toHaveBeenCalledWith(new HistoryItem({ entry, fileSystem, viewerState: viewerStateB }));
        });

        test('it does nothing if the same language is passed', async () => {
            const replace = jest.spyOn(services.historyController, 'replace');
            const controller = new TextViewerControllerImpl({ ...services });
            const entry = entries.get('/a.txt')!;
            const viewerState = new TextViewerState({ scrollPosition: Point.zero });
            controller.initialize({ entry, fileSystem, viewerState });
            await immediate();
            expect(replace).not.toHaveBeenCalled();
            controller.setLanguage('plaintext');
            expect(replace).not.toHaveBeenCalled();
        });

        test('it does nothing before initialization', async () => {
            const replace = jest.spyOn(services.historyController, 'replace');
            const controller = new TextViewerControllerImpl({ ...services });
            controller.setLanguage('css');
            await immediate();
            expect(replace).not.toHaveBeenCalled();
        });
    });

    describe('textViewerController.scrollTo() method', () => {
        test('it replaces the history item', async () => {
            const replace = jest.spyOn(services.historyController, 'replace');
            const controller = new TextViewerControllerImpl({ ...services });
            const entry = entries.get('/a.txt')!;
            const viewerStateA = new TextViewerState();
            controller.initialize({ entry, fileSystem, viewerState: viewerStateA });
            await immediate();
            expect(replace).not.toHaveBeenCalled();
            controller.scrollTo({ position: new Point(100, 200) });
            const viewerStateB = new TextViewerState({ scrollPosition: new Point(100, 200) });
            expect(replace).toHaveBeenCalledTimes(1);
            expect(replace).toHaveBeenCalledWith(new HistoryItem({ entry, fileSystem, viewerState: viewerStateB }));
        });

        test('it does nothing if the passed position is the same as the current position', async () => {
            const replace = jest.spyOn(services.historyController, 'replace');
            const controller = new TextViewerControllerImpl({ ...services });
            const entry = entries.get('/a.txt')!;
            const viewerState = new TextViewerState({ scrollPosition: Point.zero });
            controller.initialize({ entry, fileSystem, viewerState });
            await immediate();
            expect(replace).not.toHaveBeenCalled();
            controller.scrollTo({ position: Point.zero });
            expect(replace).not.toHaveBeenCalled();
        });

        test('it does nothing before initialization', async () => {
            const replace = jest.spyOn(services.historyController, 'replace');
            const controller = new TextViewerControllerImpl({ ...services });
            controller.scrollTo({ position: new Point(100, 200) });
            expect(replace).not.toHaveBeenCalled();
        });
    });
});
