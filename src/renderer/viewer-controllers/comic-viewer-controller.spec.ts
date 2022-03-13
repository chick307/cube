import { DirectoryEntry, Entry, FileEntry } from '../../common/entities/entry';
import { DummyFileSystem } from '../../common/entities/file-system.test-helper';
import { immediate } from '../../common/utils/immediate';
import { EntryPath } from '../../common/values/entry-path';
import { ComicViewerState } from '../../common/values/viewer-state';
import type { HistoryController } from '../controllers/history-controller';
import { createHistoryController } from '../controllers/history-controller.test-helper';
import type { EntryService } from '../services/entry-service';
import { createEntryService } from '../services/entry-service.test-helper';
import { ImageService } from '../services/image-service';
import { createImageService } from '../services/image-service.test-helper';
import { ComicViewerControllerImpl } from './comic-viewer-controller';

const entries = new Map<string, Entry>([
    '/',
    '/a/',
    '/a/001.jpeg',
    '/a/002.jpg',
    '/a/003.png',
    '/a/a1/',
    '/a/a1/004.jpeg',
    '/a/a2/',
    '/a/a2/a3/',
    '/a/a2/a3/005.jpeg',
    '/a/.dotfile.jpeg',
    '/b/',
    '/b/001.jpeg',
    '/b/002.jpeg',
    '/empty/',
].map((path) => {
    if (path.endsWith('/')) {
        const pathString = path.slice(0, -1) || '/';
        return [pathString, new DirectoryEntry(new EntryPath(pathString))];
    }
    return [path, new FileEntry(new EntryPath(path))];
}));

const fileSystem = new DummyFileSystem();

const singlePageSpreadsA = [
    {
        pages: [
            { entry: entries.get('/a/001.jpeg') },
        ],
    },
    {
        pages: [
            { entry: entries.get('/a/002.jpg') },
        ],
    },
    {
        pages: [
            { entry: entries.get('/a/003.png') },
        ],
    },
    {
        pages: [
            { entry: entries.get('/a/a1/004.jpeg') },
        ],
    },
    {
        pages: [
            { entry: entries.get('/a/a2/a3/005.jpeg') },
        ],
    },
];

const twoPageSpreadsA = [
    {
        pages: [
            { entry: entries.get('/a/001.jpeg') },
        ],
    },
    {
        pages: [
            { entry: entries.get('/a/002.jpg') },
            { entry: entries.get('/a/003.png') },
        ],
    },
    {
        pages: [
            { entry: entries.get('/a/a1/004.jpeg') },
            { entry: entries.get('/a/a2/a3/005.jpeg') },
        ],
    },
];

const twoPageSpreadsB = [
    {
        pages: [
            { entry: entries.get('/b/001.jpeg') },
        ],
    },
    {
        pages: [
            { entry: entries.get('/b/002.jpeg') },
        ],
    },
];

let services: {
    entryService: EntryService;
    historyController: HistoryController;
    imageService: ImageService;
};

beforeEach(() => {
    const { entryService } = createEntryService();

    const readDirectory = jest.spyOn(entryService, 'readDirectory');
    readDirectory.mockImplementation((params) => {
        if (!(params.fileSystem instanceof DummyFileSystem))
            return Promise.reject(Error());
        const prefix = params.entry.path.toString() === '/' ? '/' : `${params.entry.path}/`;
        const paths = [...entries.keys()]
            .filter((path) => path.startsWith(prefix) && !path.includes('/', prefix.length));
        const result = paths.map((path) => entries.get(path)!);
        return Promise.resolve(result);
    });

    const { historyController } = createHistoryController();

    const { imageService } = createImageService();
    const loadImage = jest.spyOn(imageService, 'loadImage');
    loadImage.mockImplementation(async () => new Image());

    services = {
        entryService,
        historyController,
        imageService,
    };
});

afterEach((() => {
    services = null!;
}));

describe('ComicViewerControllerImpl class', () => {
    describe('comicViewerController.initialize() method', () => {
        test('it initializes the state', async () => {
            const comicViewerController = new ComicViewerControllerImpl({ ...services });
            const entry = entries.get('/a')!;
            const viewerState = new ComicViewerState({ pageDisplay: 'two' });
            comicViewerController.initialize({ entry, fileSystem, viewerState });
            expect(comicViewerController.state.current).toEqual({
                currentSpread: null,
                pageDisplay: 'two',
                spreads: [],
            });
            await immediate();
            expect(comicViewerController.state.current).toEqual({
                currentSpread: {
                    pages: [
                        { entry: entries.get('/a/001.jpeg'), image: expect.any(HTMLImageElement) },
                    ],
                },
                pageDisplay: 'two',
                spreads: [
                    ...twoPageSpreadsA.map(({ pages }) => ({
                        pages: pages.map(({ entry }) => expect.objectContaining({ entry })),
                    })),
                ],
            });
        });

        test('it does nothing if the passed parameters are the same as last', async () => {
            const comicViewerController = new ComicViewerControllerImpl({ ...services });
            const entry = entries.get('/a')!;
            const viewerState = new ComicViewerState({ pageDisplay: 'two' });
            const expectedState = {
                currentSpread: {
                    pages: [
                        { entry: entries.get('/a/001.jpeg'), image: expect.any(HTMLImageElement) },
                    ],
                },
                pageDisplay: 'two',
                spreads: twoPageSpreadsA.map(({ pages }) => ({
                    pages: pages.map(({ entry }) => expect.objectContaining({ entry })),
                })),
            };
            comicViewerController.initialize({ entry, fileSystem, viewerState });
            await immediate();
            expect(comicViewerController.state.current).toEqual(expectedState);
            comicViewerController.initialize({ entry, fileSystem, viewerState });
            expect(comicViewerController.state.current).toEqual(expectedState);
            await immediate();
            expect(comicViewerController.state.current).toEqual(expectedState);
        });

        test('it updates the entry', async () => {
            const comicViewerController = new ComicViewerControllerImpl({ ...services });
            const entryA = entries.get('/a')!;
            const entryB = entries.get('/b')!;
            const viewerState = new ComicViewerState({ pageDisplay: 'two' });
            comicViewerController.initialize({ entry: entryA, fileSystem, viewerState });
            await immediate();
            comicViewerController.initialize({ entry: entryB, fileSystem, viewerState });
            await immediate();
            expect(comicViewerController.state.current).toEqual({
                currentSpread: {
                    pages: [
                        { entry: entries.get('/b/001.jpeg'), image: expect.any(HTMLImageElement) },
                    ],
                },
                pageDisplay: 'two',
                spreads: twoPageSpreadsB.map(({ pages }) => ({
                    pages: pages.map(({ entry }) => expect.objectContaining({ entry })),
                })),
            });
        });

        test('it updates the viewer state', async () => {
            const comicViewerController = new ComicViewerControllerImpl({ ...services });
            const entry = entries.get('/a')!;
            const viewerStateA = new ComicViewerState({ pageDisplay: 'two' });
            const viewerStateB = new ComicViewerState({ pageDisplay: 'single' });
            comicViewerController.initialize({ entry, fileSystem, viewerState: viewerStateA });
            await immediate();
            comicViewerController.initialize({ entry, fileSystem, viewerState: viewerStateB });
            await immediate();
            expect(comicViewerController.state.current).toEqual({
                currentSpread: {
                    pages: [
                        { entry: entries.get('/a/001.jpeg'), image: expect.any(HTMLImageElement) },
                    ],
                },
                pageDisplay: 'single',
                spreads: singlePageSpreadsA.map(({ pages }) => ({
                    pages: pages.map(({ entry }) => expect.objectContaining({ entry })),
                })),
            });
        });

        test('it sets the spreads state to an empty array', async () => {
            const comicViewerController = new ComicViewerControllerImpl({ ...services });
            const entry = entries.get('/empty')!;
            const viewerState = new ComicViewerState({ pageDisplay: 'two' });
            comicViewerController.initialize({ entry, fileSystem, viewerState });
            await immediate();
            expect(comicViewerController.state.current).toEqual({
                currentSpread: null,
                pageDisplay: 'two',
                spreads: [],
            });
        });
    });

    describe('comicViewerController.openFirstPage() method', () => {
        test('it opens the first page', async () => {
            const comicViewerController = new ComicViewerControllerImpl({ ...services });
            const entry = entries.get('/a')!;
            const viewerState = new ComicViewerState({ pageDisplay: 'single' });
            const expectedState = {
                pageDisplay: 'single',
                spreads: singlePageSpreadsA.map(({ pages }) => ({
                    pages: pages.map(({ entry }) => expect.objectContaining({ entry })),
                })),
            };
            comicViewerController.initialize({ entry, fileSystem, viewerState });
            await immediate();
            comicViewerController.openPage(2);
            await immediate();
            comicViewerController.openFirstPage();
            await immediate();
            expect(comicViewerController.state.current).toEqual({
                ...expectedState,
                currentSpread: {
                    pages: [
                        { entry: entries.get('/a/001.jpeg'), image: expect.any(HTMLImageElement) },
                    ],
                },
            });
        });

        test('it opens the first spread', async () => {
            const comicViewerController = new ComicViewerControllerImpl({ ...services });
            const entry = entries.get('/a')!;
            const viewerState = new ComicViewerState({ pageDisplay: 'two' });
            const expectedState = {
                pageDisplay: 'two',
                spreads: twoPageSpreadsA.map(({ pages }) => ({
                    pages: pages.map(({ entry }) => expect.objectContaining({ entry })),
                })),
            };
            comicViewerController.initialize({ entry, fileSystem, viewerState });
            await immediate();
            comicViewerController.openPage(2);
            await immediate();
            comicViewerController.openFirstPage();
            await immediate();
            expect(comicViewerController.state.current).toEqual({
                ...expectedState,
                currentSpread: {
                    pages: [
                        { entry: entries.get('/a/001.jpeg'), image: expect.any(HTMLImageElement) },
                    ],
                },
            });
        });
    });

    describe('comicViewerController.openNextPage() method', () => {
        test('it opens the next page', async () => {
            const comicViewerController = new ComicViewerControllerImpl({ ...services });
            const entry = entries.get('/a')!;
            const viewerState = new ComicViewerState({ pageDisplay: 'single' });
            const expectedState = {
                pageDisplay: 'single',
                spreads: singlePageSpreadsA.map(({ pages }) => ({
                    pages: pages.map(({ entry }) => expect.objectContaining({ entry })),
                })),
            };
            comicViewerController.initialize({ entry, fileSystem, viewerState });
            await immediate();
            comicViewerController.openPage(2);
            await immediate();
            comicViewerController.openNextPage();
            await immediate();
            expect(comicViewerController.state.current).toEqual({
                ...expectedState,
                currentSpread: {
                    pages: [
                        { entry: entries.get('/a/a1/004.jpeg'), image: expect.any(HTMLImageElement) },
                    ],
                },
            });
        });

        test('it opens the next spread', async () => {
            const comicViewerController = new ComicViewerControllerImpl({ ...services });
            const entry = entries.get('/a')!;
            const viewerState = new ComicViewerState({ pageDisplay: 'two' });
            const expectedState = {
                pageDisplay: 'two',
                spreads: twoPageSpreadsA.map(({ pages }) => ({
                    pages: pages.map(({ entry }) => expect.objectContaining({ entry })),
                })),
            };
            comicViewerController.initialize({ entry, fileSystem, viewerState });
            await immediate();
            comicViewerController.openPage(2);
            await immediate();
            comicViewerController.openNextPage();
            await immediate();
            expect(comicViewerController.state.current).toEqual({
                ...expectedState,
                currentSpread: {
                    pages: [
                        { entry: entries.get('/a/a1/004.jpeg'), image: expect.any(HTMLImageElement) },
                        { entry: entries.get('/a/a2/a3/005.jpeg'), image: expect.any(HTMLImageElement) },
                    ],
                },
            });
        });
    });

    describe('comicViewerController.openLastPage() method', () => {
        test('it opens the last page', async () => {
            const comicViewerController = new ComicViewerControllerImpl({ ...services });
            const entry = entries.get('/a')!;
            const viewerState = new ComicViewerState({ pageDisplay: 'single' });
            const expectedState = {
                pageDisplay: 'single',
                spreads: singlePageSpreadsA.map(({ pages }) => ({
                    pages: pages.map(({ entry }) => expect.objectContaining({ entry })),
                })),
            };
            comicViewerController.initialize({ entry, fileSystem, viewerState });
            await immediate();
            comicViewerController.openPage(2);
            await immediate();
            comicViewerController.openLastPage();
            await immediate();
            expect(comicViewerController.state.current).toEqual({
                ...expectedState,
                currentSpread: {
                    pages: [
                        { entry: entries.get('/a/a2/a3/005.jpeg'), image: expect.any(HTMLImageElement) },
                    ],
                },
            });
        });

        test('it opens the last spread', async () => {
            const comicViewerController = new ComicViewerControllerImpl({ ...services });
            const entry = entries.get('/a')!;
            const viewerState = new ComicViewerState({ pageDisplay: 'two' });
            const expectedState = {
                pageDisplay: 'two',
                spreads: twoPageSpreadsA.map(({ pages }) => ({
                    pages: pages.map(({ entry }) => expect.objectContaining({ entry })),
                })),
            };
            comicViewerController.initialize({ entry, fileSystem, viewerState });
            await immediate();
            comicViewerController.openPage(2);
            await immediate();
            comicViewerController.openLastPage();
            await immediate();
            expect(comicViewerController.state.current).toEqual({
                ...expectedState,
                currentSpread: {
                    pages: [
                        { entry: entries.get('/a/a1/004.jpeg'), image: expect.any(HTMLImageElement) },
                        { entry: entries.get('/a/a2/a3/005.jpeg'), image: expect.any(HTMLImageElement) },
                    ],
                },
            });
        });
    });

    describe('comicViewerController.openLeftPage() method', () => {
        test('it opens the left page', async () => {
            const comicViewerController = new ComicViewerControllerImpl({ ...services });
            const entry = entries.get('/a')!;
            const viewerState = new ComicViewerState({ pageDisplay: 'single' });
            const expectedState = {
                pageDisplay: 'single',
                spreads: singlePageSpreadsA.map(({ pages }) => ({
                    pages: pages.map(({ entry }) => expect.objectContaining({ entry })),
                })),
            };
            comicViewerController.initialize({ entry, fileSystem, viewerState });
            await immediate();
            comicViewerController.openPage(2);
            await immediate();
            comicViewerController.openLeftPage();
            await immediate();
            expect(comicViewerController.state.current).toEqual({
                ...expectedState,
                currentSpread: {
                    pages: [
                        { entry: entries.get('/a/a1/004.jpeg'), image: expect.any(HTMLImageElement) },
                    ],
                },
            });
        });

        test('it opens the left spread', async () => {
            const comicViewerController = new ComicViewerControllerImpl({ ...services });
            const entry = entries.get('/a')!;
            const viewerState = new ComicViewerState({ pageDisplay: 'two' });
            const expectedState = {
                pageDisplay: 'two',
                spreads: twoPageSpreadsA.map(({ pages }) => ({
                    pages: pages.map(({ entry }) => expect.objectContaining({ entry })),
                })),
            };
            comicViewerController.initialize({ entry, fileSystem, viewerState });
            await immediate();
            comicViewerController.openPage(2);
            await immediate();
            comicViewerController.openLeftPage();
            await immediate();
            expect(comicViewerController.state.current).toEqual({
                ...expectedState,
                currentSpread: {
                    pages: [
                        { entry: entries.get('/a/a1/004.jpeg'), image: expect.any(HTMLImageElement) },
                        { entry: entries.get('/a/a2/a3/005.jpeg'), image: expect.any(HTMLImageElement) },
                    ],
                },
            });
        });
    });

    describe('comicViewerController.openPage() method', () => {
        test('it opens the specified page', async () => {
            const comicViewerController = new ComicViewerControllerImpl({ ...services });
            const entry = entries.get('/a')!;
            const viewerState = new ComicViewerState({ pageDisplay: 'single' });
            const expectedState = {
                pageDisplay: 'single',
                spreads: singlePageSpreadsA.map(({ pages }) => ({
                    pages: pages.map(({ entry }) => expect.objectContaining({ entry })),
                })),
            };
            comicViewerController.initialize({ entry, fileSystem, viewerState });
            await immediate();
            comicViewerController.openPage(2);
            await immediate();
            expect(comicViewerController.state.current).toEqual({
                ...expectedState,
                currentSpread: {
                    pages: [
                        { entry: entries.get('/a/003.png'), image: expect.any(HTMLImageElement) },
                    ],
                },
            });
            comicViewerController.openPage(3);
            await immediate();
            expect(comicViewerController.state.current).toEqual({
                ...expectedState,
                currentSpread: {
                    pages: [
                        { entry: entries.get('/a/a1/004.jpeg'), image: expect.any(HTMLImageElement) },
                    ],
                },
            });
            comicViewerController.openPage(4);
            await immediate();
            expect(comicViewerController.state.current).toEqual({
                ...expectedState,
                currentSpread: {
                    pages: [
                        { entry: entries.get('/a/a2/a3/005.jpeg'), image: expect.any(HTMLImageElement) },
                    ],
                },
            });
        });

        test('it opens the spread including the specified page', async () => {
            const comicViewerController = new ComicViewerControllerImpl({ ...services });
            const entry = entries.get('/a')!;
            const viewerState = new ComicViewerState({ pageDisplay: 'two' });
            const expectedState = {
                pageDisplay: 'two',
                spreads: twoPageSpreadsA.map(({ pages }) => ({
                    pages: pages.map(({ entry }) => expect.objectContaining({ entry })),
                })),
            };
            comicViewerController.initialize({ entry, fileSystem, viewerState });
            await immediate();
            comicViewerController.openPage(2);
            await immediate();
            expect(comicViewerController.state.current).toEqual({
                ...expectedState,
                currentSpread: {
                    pages: [
                        { entry: entries.get('/a/002.jpg'), image: expect.any(HTMLImageElement) },
                        { entry: entries.get('/a/003.png'), image: expect.any(HTMLImageElement) },
                    ],
                },
            });
            comicViewerController.openPage(3);
            await immediate();
            expect(comicViewerController.state.current).toEqual({
                ...expectedState,
                currentSpread: {
                    pages: [
                        { entry: entries.get('/a/a1/004.jpeg'), image: expect.any(HTMLImageElement) },
                        { entry: entries.get('/a/a2/a3/005.jpeg'), image: expect.any(HTMLImageElement) },
                    ],
                },
            });
            comicViewerController.openPage(4);
            await immediate();
            expect(comicViewerController.state.current).toEqual({
                ...expectedState,
                currentSpread: {
                    pages: [
                        { entry: entries.get('/a/a1/004.jpeg'), image: expect.any(HTMLImageElement) },
                        { entry: entries.get('/a/a2/a3/005.jpeg'), image: expect.any(HTMLImageElement) },
                    ],
                },
            });
        });
    });

    describe('comicViewerController.openPreviousPage() method', () => {
        test('it opens the previous page', async () => {
            const comicViewerController = new ComicViewerControllerImpl({ ...services });
            const entry = entries.get('/a')!;
            const viewerState = new ComicViewerState({ pageDisplay: 'single' });
            const expectedState = {
                pageDisplay: 'single',
                spreads: singlePageSpreadsA.map(({ pages }) => ({
                    pages: pages.map(({ entry }) => expect.objectContaining({ entry })),
                })),
            };
            comicViewerController.initialize({ entry, fileSystem, viewerState });
            await immediate();
            comicViewerController.openPage(2);
            await immediate();
            comicViewerController.openPreviousPage();
            await immediate();
            expect(comicViewerController.state.current).toEqual({
                ...expectedState,
                currentSpread: {
                    pages: [
                        { entry: entries.get('/a/002.jpg'), image: expect.any(HTMLImageElement) },
                    ],
                },
            });
        });

        test('it opens the previous spread', async () => {
            const comicViewerController = new ComicViewerControllerImpl({ ...services });
            const entry = entries.get('/a')!;
            const viewerState = new ComicViewerState({ pageDisplay: 'two' });
            const expectedState = {
                pageDisplay: 'two',
                spreads: twoPageSpreadsA.map(({ pages }) => ({
                    pages: pages.map(({ entry }) => expect.objectContaining({ entry })),
                })),
            };
            comicViewerController.initialize({ entry, fileSystem, viewerState });
            await immediate();
            comicViewerController.openPage(2);
            await immediate();
            comicViewerController.openPreviousPage();
            await immediate();
            expect(comicViewerController.state.current).toEqual({
                ...expectedState,
                currentSpread: {
                    pages: [
                        { entry: entries.get('/a/001.jpeg'), image: expect.any(HTMLImageElement) },
                    ],
                },
            });
        });
    });

    describe('comicViewerController.openRightPage() method', () => {
        test('it opens the right page', async () => {
            const comicViewerController = new ComicViewerControllerImpl({ ...services });
            const entry = entries.get('/a')!;
            const viewerState = new ComicViewerState({ pageDisplay: 'single' });
            const expectedState = {
                pageDisplay: 'single',
                spreads: singlePageSpreadsA.map(({ pages }) => ({
                    pages: pages.map(({ entry }) => expect.objectContaining({ entry })),
                })),
            };
            comicViewerController.initialize({ entry, fileSystem, viewerState });
            await immediate();
            comicViewerController.openPage(2);
            await immediate();
            comicViewerController.openRightPage();
            await immediate();
            expect(comicViewerController.state.current).toEqual({
                ...expectedState,
                currentSpread: {
                    pages: [
                        { entry: entries.get('/a/002.jpg'), image: expect.any(HTMLImageElement) },
                    ],
                },
            });
        });

        test('it opens the right spread', async () => {
            const comicViewerController = new ComicViewerControllerImpl({ ...services });
            const entry = entries.get('/a')!;
            const viewerState = new ComicViewerState({ pageDisplay: 'two' });
            const expectedState = {
                pageDisplay: 'two',
                spreads: twoPageSpreadsA.map(({ pages }) => ({
                    pages: pages.map(({ entry }) => expect.objectContaining({ entry })),
                })),
            };
            comicViewerController.initialize({ entry, fileSystem, viewerState });
            await immediate();
            comicViewerController.openPage(2);
            await immediate();
            comicViewerController.openRightPage();
            await immediate();
            expect(comicViewerController.state.current).toEqual({
                ...expectedState,
                currentSpread: {
                    pages: [
                        { entry: entries.get('/a/001.jpeg'), image: expect.any(HTMLImageElement) },
                    ],
                },
            });
        });
    });

    describe('comicViewerController.setPageDisplay() method', () => {
        test('it updates the page display state', async () => {
            const comicViewerController = new ComicViewerControllerImpl({ ...services });
            const entry = entries.get('/a')!;
            const viewerState = new ComicViewerState({ pageDisplay: 'single' });
            comicViewerController.initialize({ entry, fileSystem, viewerState });
            await immediate();
            comicViewerController.openPage(2);
            comicViewerController.setPageDisplay('two');
            await immediate();
            expect(comicViewerController.state.current).toEqual({
                currentSpread: {
                    pages: [
                        { entry: entries.get('/a/002.jpg'), image: expect.any(HTMLImageElement) },
                        { entry: entries.get('/a/003.png'), image: expect.any(HTMLImageElement) },
                    ],
                },
                pageDisplay: 'two',
                spreads: twoPageSpreadsA.map(({ pages }) => ({
                    pages: pages.map(({ entry }) => expect.objectContaining({ entry })),
                })),
            });
            comicViewerController.setPageDisplay('two');
            await immediate();
            expect(comicViewerController.state.current).toEqual({
                currentSpread: {
                    pages: [
                        { entry: entries.get('/a/002.jpg'), image: expect.any(HTMLImageElement) },
                        { entry: entries.get('/a/003.png'), image: expect.any(HTMLImageElement) },
                    ],
                },
                pageDisplay: 'two',
                spreads: twoPageSpreadsA.map(({ pages }) => ({
                    pages: pages.map(({ entry }) => expect.objectContaining({ entry })),
                })),
            });
            comicViewerController.setPageDisplay('single');
            await immediate();
            expect(comicViewerController.state.current).toEqual({
                currentSpread: {
                    pages: [
                        { entry: entries.get('/a/002.jpg'), image: expect.any(HTMLImageElement) },
                    ],
                },
                pageDisplay: 'single',
                spreads: singlePageSpreadsA.map(({ pages }) => ({
                    pages: pages.map(({ entry }) => expect.objectContaining({ entry })),
                })),
            });
            comicViewerController.setPageDisplay('single');
            await immediate();
            expect(comicViewerController.state.current).toEqual({
                currentSpread: {
                    pages: [
                        { entry: entries.get('/a/002.jpg'), image: expect.any(HTMLImageElement) },
                    ],
                },
                pageDisplay: 'single',
                spreads: singlePageSpreadsA.map(({ pages }) => ({
                    pages: pages.map(({ entry }) => expect.objectContaining({ entry })),
                })),
            });
        });

        test('it does nothing before initialization', async () => {
            const comicViewerController = new ComicViewerControllerImpl({ ...services });
            comicViewerController.setPageDisplay('single');
            await immediate();
            expect(comicViewerController.state.current).toEqual({
                currentSpread: null,
                pageDisplay: 'two',
                spreads: [],
            });
        });
    });
});
