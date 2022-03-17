import { createEntryMap } from '../../common/entities/entry.test-helper';
import { DummyFileSystem } from '../../common/entities/file-system.test-helper';
import { immediate } from '../../common/utils/immediate';
import { TsvViewerState } from '../../common/values/viewer-state';
import type { EntryService } from '../services/entry-service';
import { createEntryService } from '../services/entry-service.test-helper';
import { TsvViewerControllerImpl } from './tsv-viewer-controller';

const entries = createEntryMap([
    '/a.tsv',
    '/ends-with-linefeed.tsv',
    '/empty',
]);


const fileSystem = new DummyFileSystem();

let services: {
    entryService: EntryService;
};

beforeEach(() => {
    const { entryService } = createEntryService();
    const readFile = jest.spyOn(entryService, 'readFile');
    readFile.mockImplementation(async (params) => {
        if (params.fileSystem !== fileSystem)
            throw Error();
        if (params.entry.equals(entries.get('/a.tsv')))
            return Buffer.from('a\tb\tc\n1\t2\t3');
        if (params.entry.equals(entries.get('/ends-with-linefeed.tsv')))
            return Buffer.from('a\tb\tc\n1\t2\t3\n');
        if (params.entry.equals(entries.get('/empty')))
            return Buffer.from('');
        throw Error();
    });

    services = {
        entryService,
    };
});

afterEach(() => {
    services = null!;
});

const defaultState = {
    header: { cells: [], id: 'header' },
    rows: [],
};

describe('TsvViewerControllerImpl class', () => {
    describe('tsvViewerController.initialize() method', () => {
        test('it reads the TSV file', async () => {
            const controller = new TsvViewerControllerImpl({ ...services });
            const entry = entries.get('/a.tsv')!;
            const viewerState = new TsvViewerState();
            controller.initialize({ entry, fileSystem, viewerState });
            expect(controller.state.current).toEqual({ ...defaultState });
            await immediate();
            expect(controller.state.current).toEqual({
                ...defaultState,
                header: {
                    cells: [
                        { id: expect.any(String), value: 'a' },
                        { id: expect.any(String), value: 'b' },
                        { id: expect.any(String), value: 'c' },
                    ],
                    id: expect.any(String),
                },
                rows: [
                    {
                        cells: [
                            { id: expect.any(String), value: '1' },
                            { id: expect.any(String), value: '2' },
                            { id: expect.any(String), value: '3' },
                        ],
                        id: expect.any(String),
                    },
                ],
            });
        });

        test('it ignores the tailing linefeed of the TSV file', async () => {
            const controller = new TsvViewerControllerImpl({ ...services });
            const entry = entries.get('/ends-with-linefeed.tsv')!;
            const viewerState = new TsvViewerState();
            controller.initialize({ entry, fileSystem, viewerState });
            expect(controller.state.current).toEqual({ ...defaultState });
            await immediate();
            expect(controller.state.current).toEqual({
                ...defaultState,
                header: {
                    cells: [
                        { id: expect.any(String), value: 'a' },
                        { id: expect.any(String), value: 'b' },
                        { id: expect.any(String), value: 'c' },
                    ],
                    id: expect.any(String),
                },
                rows: [
                    {
                        cells: [
                            { id: expect.any(String), value: '1' },
                            { id: expect.any(String), value: '2' },
                            { id: expect.any(String), value: '3' },
                        ],
                        id: expect.any(String),
                    },
                ],
            });
        });

        test('it does not create the header for empty files', async () => {
            const controller = new TsvViewerControllerImpl({ ...services });
            const entry = entries.get('/empty')!;
            const viewerState = new TsvViewerState();
            controller.initialize({ entry, fileSystem, viewerState });
            expect(controller.state.current).toEqual({ ...defaultState });
            await immediate();
            expect(controller.state.current).toEqual({
                ...defaultState,
                header: {
                    cells: [],
                    id: expect.any(String),
                },
                rows: [],
            });
        });

        test('it does nothing if called with the same parameters', async () => {
            const controller = new TsvViewerControllerImpl({ ...services });
            const entry = entries.get('/a.tsv')!;
            const viewerState = new TsvViewerState();
            controller.initialize({ entry, fileSystem, viewerState });
            expect(controller.state.current).toEqual({ ...defaultState });
            await immediate();
            controller.initialize({ entry, fileSystem, viewerState });
            expect(controller.state.current).toEqual({
                ...defaultState,
                header: {
                    cells: [
                        { id: expect.any(String), value: 'a' },
                        { id: expect.any(String), value: 'b' },
                        { id: expect.any(String), value: 'c' },
                    ],
                    id: expect.any(String),
                },
                rows: [
                    {
                        cells: [
                            { id: expect.any(String), value: '1' },
                            { id: expect.any(String), value: '2' },
                            { id: expect.any(String), value: '3' },
                        ],
                        id: expect.any(String),
                    },
                ],
            });
            await immediate();
            expect(controller.state.current).toEqual({
                ...defaultState,
                header: {
                    cells: [
                        { id: expect.any(String), value: 'a' },
                        { id: expect.any(String), value: 'b' },
                        { id: expect.any(String), value: 'c' },
                    ],
                    id: expect.any(String),
                },
                rows: [
                    {
                        cells: [
                            { id: expect.any(String), value: '1' },
                            { id: expect.any(String), value: '2' },
                            { id: expect.any(String), value: '3' },
                        ],
                        id: expect.any(String),
                    },
                ],
            });
        });
    });
});
