import { act, cleanup, fireEvent, render } from '@testing-library/react';

import { createEntryMap } from '../../../common/entities/entry.test-helper';
import { DummyFileSystem } from '../../../common/entities/file-system.test-helper';
import { immediate } from '../../../common/utils/immediate';
import { ComicViewerState } from '../../../common/values/viewer-state';
import { ComicViewerPageDisplay } from '../../../common/values/viewer-state/comic-viewer-state';
import type { HistoryController } from '../../controllers/history-controller';
import { createHistoryController } from '../../controllers/history-controller.test-helper';
import type { ComicViewerControllerFactory } from '../../factories/viewer-controller-factory';
import { useStatusBar } from '../../gateways/status-bar-gateway';
import { ServicesProvider } from '../../hooks/use-service';
import type { EntryIconService } from '../../services/entry-icon-service';
import { createEntryIconService } from '../../services/entry-icon-service.test-helper';
import type { EntryService } from '../../services/entry-service';
import { createEntryService } from '../../services/entry-service.test-helper';
import { KeyboardService } from '../../services/keyboard-service';
import { createKeyboardService } from '../../services/keyboard-service.test-helper';
import type { LocalEntryService } from '../../services/local-entry-service';
import { createLocalEntryService } from '../../services/local-entry-service.test-helper';
import { composeElements } from '../../utils/compose-elements';
import type {
    ComicViewerController,
    ComicViewerPage,
    ComicViewerSpread,
} from '../../viewer-controllers/comic-viewer-controller';
import { createComicViewerController } from '../../viewer-controllers/comic-viewer-controller.test-helper';
import { ComicViewer } from './comic-viewer';
import styles from './comic-viewer.module.css';

const entries = createEntryMap([
    '/a/',
    '/a/1.png',
    '/a/2.png',
    '/a/3.png',
    '/a/4.png',
    '/a/5.png',
]);

const fileSystem = new DummyFileSystem();

let services: {
    $viewerController: ComicViewerController;

    entryService: EntryService;

    entryIconService: EntryIconService;

    historyController: HistoryController;

    keyboardService: KeyboardService;

    localEntryService: LocalEntryService;

    viewerControllerFactory: ComicViewerControllerFactory;
};

let controller: {
    emitKeyDown(key: string): void;
    loadImages(): Promise<void>;
    setCurrentSpread(index: number): Promise<void>;
    setPageDisplay(value: ComicViewerPageDisplay): Promise<void>;
    setSpreads(value: { pages: Omit<ComicViewerPage, 'image'>[]; }[]): Promise<void>;
};

let container: HTMLElement;

beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    const { entryIconService } = createEntryIconService();

    const { entryService } = createEntryService();
    const readFile = jest.spyOn(entryService, 'readFile');
    readFile.mockImplementation(async () => Buffer.from([0]));

    const {
        comicViewerController: $viewerController,
        comicViewerControllerRestate,
    } = createComicViewerController();

    const { historyController } = createHistoryController();

    const {
        keyDownEventController,
        keyboardService,
    } = createKeyboardService();

    const { localEntryService } = createLocalEntryService();

    const viewerControllerFactory: ComicViewerControllerFactory = {
        createComicViewerController: () => $viewerController,
    };

    controller = {
        emitKeyDown: (key) => keyDownEventController.emit({ key }),
        loadImages: () => {
            return comicViewerControllerRestate.update((state) => ({
                ...state,
                currentSpread: state.currentSpread === null ? null : {
                    pages: state.currentSpread.pages
                        .map(({ entry }) => ({ entry, image: new Image() })) as ComicViewerSpread['pages'],
                },
            }));
        },
        setCurrentSpread: (index) =>
            comicViewerControllerRestate.update((state) => ({ ...state, currentSpread: state.spreads[index] })),
        setPageDisplay: (value) => comicViewerControllerRestate.update((state) => ({ ...state, pageDisplay: value })),
        setSpreads: (value) => {
            return comicViewerControllerRestate.update((state) => {
                const spreads = value.map((spread) => {
                    const pages =
                        spread.pages.map(({ entry }) => ({ entry, image: null })) as ComicViewerSpread['pages'];
                    return { pages };
                });
                return ({ ...state, currentSpread: spreads[0], spreads });
            });
        },
    };

    services = {
        $viewerController,
        entryIconService,
        entryService,
        historyController,
        keyboardService,
        localEntryService,
        viewerControllerFactory,
    };
});

afterEach(() => {
    cleanup();
    container.remove();
    container = null!;

    services = null!;
    controller = null!;

    jest.resetAllMocks();
});

describe('ComicViewer component', () => {
    test('it renders the comic', async () => {
        const canvasGetContext = jest.spyOn(HTMLCanvasElement.prototype, 'getContext');
        canvasGetContext.mockImplementation(() => ({
            drawImage: () => {},
        }) as any);
        const initialize = jest.spyOn(services.$viewerController, 'initialize');
        const entry = entries.get('/a')!;
        const viewerState = new ComicViewerState();
        const Component = () => {
            const { StatusBarExit, StatusBarProvider } = useStatusBar();
            return composeElements(
                <ServicesProvider value={services} />,
                <div>
                    {composeElements(
                        <StatusBarProvider />,
                        <ComicViewer {...{ entry, fileSystem, viewerState }} />,
                    )}
                    <div className="test-status-bar">
                        <StatusBarExit />,
                    </div>
                </div>,
            );
        };
        await act(async () => {
            render(<Component />, { container });
            await immediate();
        });
        expect(initialize).toHaveBeenCalledTimes(1);
        expect(initialize).toHaveBeenCalledWith({ entry, fileSystem, viewerState });
        expect(Array.from(container.getElementsByTagName('canvas'))).toEqual([expect.any(HTMLCanvasElement)]);
        expect(Array.from(container.getElementsByClassName(styles.entryNameText))).toEqual([]);
        expect(Array.from(container.getElementsByClassName(styles.pageDisplaySelect)))
            .toEqual([expect.any(HTMLElement)]);
        await act(async () => {
            await controller.setSpreads([
                { pages: [{ entry: entries.get('/a/1.png')! }] },
                { pages: [{ entry: entries.get('/a/2.png')! }, { entry: entries.get('/a/3.png')! }] },
                { pages: [{ entry: entries.get('/a/3.png')! }, { entry: entries.get('/a/4.png')! }] },
                { pages: [{ entry: entries.get('/a/4.png')! }] },
            ]);
        });
        expect(Array.from(container.getElementsByClassName(styles.entryNameText)))
            .toEqual([expect.objectContaining({ textContent: '1.png' })]);
        expect(canvasGetContext).not.toHaveBeenCalled();
        await act(async () => {
            await controller.loadImages();
        });
        expect(canvasGetContext).toHaveBeenCalledTimes(1);
        expect(canvasGetContext).toHaveBeenCalledWith('2d');
    });

    test('it shows the image entry names', async () => {
        const entry = entries.get('/a')!;
        const viewerState = new ComicViewerState();
        const Component = () => {
            const { StatusBarExit, StatusBarProvider } = useStatusBar();
            return composeElements(
                <ServicesProvider value={services} />,
                <div>
                    {composeElements(
                        <StatusBarProvider />,
                        <ComicViewer {...{ entry, fileSystem, viewerState }} />,
                    )}
                    <div className="test-status-bar">
                        <StatusBarExit />,
                    </div>
                </div>,
            );
        };
        await act(async () => {
            render(<Component />, { container });
            await controller.setSpreads([
                { pages: [{ entry: entries.get('/a/1.png')! }] },
                { pages: [{ entry: entries.get('/a/2.png')! }, { entry: entries.get('/a/3.png')! }] },
                { pages: [{ entry: entries.get('/a/3.png')! }, { entry: entries.get('/a/4.png')! }] },
                { pages: [{ entry: entries.get('/a/4.png')! }] },
            ]);
            await controller.setCurrentSpread(1);
            await immediate();
        });
        expect(Array.from(container.getElementsByClassName(styles.entryNameText))).toEqual([
            expect.objectContaining({ textContent: '3.png' }),
            expect.objectContaining({ textContent: '2.png' }),
        ]);
    });

    test('it opens the previous page if the up key pressed', async () => {
        const openPreviousPage = jest.spyOn(services.$viewerController, 'openPreviousPage');
        const entry = entries.get('/a')!;
        const viewerState = new ComicViewerState();
        const Component = () => {
            return composeElements(
                <ServicesProvider value={services} />,
                <ComicViewer {...{ entry, fileSystem, viewerState }} />,
            );
        };
        await act(async () => {
            render(<Component />, { container });
            await immediate();
        });
        expect(openPreviousPage).not.toHaveBeenCalled();
        controller.emitKeyDown('ArrowUp');
        await immediate();
        expect(openPreviousPage).toHaveBeenCalledTimes(1);
    });

    test('it opens the next page if the down key pressed', async () => {
        const openNextPage = jest.spyOn(services.$viewerController, 'openNextPage');
        const entry = entries.get('/a')!;
        const viewerState = new ComicViewerState();
        const Component = () => {
            return composeElements(
                <ServicesProvider value={services} />,
                <ComicViewer {...{ entry, fileSystem, viewerState }} />,
            );
        };
        await act(async () => {
            render(<Component />, { container });
            await immediate();
        });
        expect(openNextPage).not.toHaveBeenCalled();
        controller.emitKeyDown('ArrowDown');
        await immediate();
        expect(openNextPage).toHaveBeenCalledTimes(1);
    });

    test('it opens the left page if the left key pressed', async () => {
        const openLeftPage = jest.spyOn(services.$viewerController, 'openLeftPage');
        const entry = entries.get('/a')!;
        const viewerState = new ComicViewerState();
        const Component = () => {
            return composeElements(
                <ServicesProvider value={services} />,
                <ComicViewer {...{ entry, fileSystem, viewerState }} />,
            );
        };
        await act(async () => {
            render(<Component />, { container });
            await immediate();
        });
        expect(openLeftPage).not.toHaveBeenCalled();
        controller.emitKeyDown('ArrowLeft');
        await immediate();
        expect(openLeftPage).toHaveBeenCalledTimes(1);
    });

    test('it opens the right page if the right key pressed', async () => {
        const openRightPage = jest.spyOn(services.$viewerController, 'openRightPage');
        const entry = entries.get('/a')!;
        const viewerState = new ComicViewerState();
        const Component = () => {
            return composeElements(
                <ServicesProvider value={services} />,
                <ComicViewer {...{ entry, fileSystem, viewerState }} />,
            );
        };
        await act(async () => {
            render(<Component />, { container });
            await immediate();
        });
        expect(openRightPage).not.toHaveBeenCalled();
        controller.emitKeyDown('ArrowRight');
        await immediate();
        expect(openRightPage).toHaveBeenCalledTimes(1);
    });

    test('it opens the first page if the home key pressed', async () => {
        const openFirstPage = jest.spyOn(services.$viewerController, 'openFirstPage');
        const entry = entries.get('/a')!;
        const viewerState = new ComicViewerState();
        const Component = () => {
            return composeElements(
                <ServicesProvider value={services} />,
                <ComicViewer {...{ entry, fileSystem, viewerState }} />,
            );
        };
        await act(async () => {
            render(<Component />, { container });
            await immediate();
        });
        expect(openFirstPage).not.toHaveBeenCalled();
        controller.emitKeyDown('Home');
        await immediate();
        expect(openFirstPage).toHaveBeenCalledTimes(1);
    });

    test('it opens the last page if the end key pressed', async () => {
        const openLastPage = jest.spyOn(services.$viewerController, 'openLastPage');
        const entry = entries.get('/a')!;
        const viewerState = new ComicViewerState();
        const Component = () => {
            return composeElements(
                <ServicesProvider value={services} />,
                <ComicViewer {...{ entry, fileSystem, viewerState }} />,
            );
        };
        await act(async () => {
            render(<Component />, { container });
            await immediate();
        });
        expect(openLastPage).not.toHaveBeenCalled();
        controller.emitKeyDown('End');
        await immediate();
        expect(openLastPage).toHaveBeenCalledTimes(1);
    });

    test('it updates the state if the page-display option is selected', async () => {
        const setPageDisplay = jest.spyOn(services.$viewerController, 'setPageDisplay');
        const entry = entries.get('/a')!;
        const viewerState = new ComicViewerState();
        const Component = () => {
            const { StatusBarExit, StatusBarProvider } = useStatusBar();
            return composeElements(
                <ServicesProvider value={services} />,
                <div>
                    {composeElements(
                        <StatusBarProvider />,
                        <ComicViewer {...{ entry, fileSystem, viewerState }} />,
                    )}
                    <div className="test-status-bar">
                        <StatusBarExit />,
                    </div>
                </div>,
            );
        };
        await act(async () => {
            render(<Component />, { container });
            await immediate();
        });
        expect(setPageDisplay).not.toHaveBeenCalled();
        expect(Array.from(container.getElementsByTagName('canvas'))).toEqual([expect.any(HTMLCanvasElement)]);
        const selectElement =
            container.getElementsByClassName(styles.pageDisplaySelect)[0].getElementsByTagName('select')[0];
        const options = Array.from(selectElement.getElementsByTagName('option'));
        const singlePageOption = options.find((option) => option.textContent === 'Single Page')!;
        const twoPagesOption = options.find((option) => option.textContent === 'Two Pages')!;
        selectElement.value = singlePageOption.value;
        fireEvent.change(selectElement);
        await immediate();
        expect(setPageDisplay).toHaveBeenCalledTimes(1);
        expect(setPageDisplay).toHaveBeenCalledWith('single');
        setPageDisplay.mockClear();
        selectElement.value = twoPagesOption.value;
        fireEvent.change(selectElement);
        await immediate();
        expect(setPageDisplay).toHaveBeenCalledTimes(1);
        expect(setPageDisplay).toHaveBeenCalledWith('two');
    });

    describe('className property', () => {
        test('it sets a class name to the comic viewer', async () => {
            const entry = entries.get('/a')!;
            const viewerState = new ComicViewerState();
            const Component = () => {
                return composeElements(
                    <ServicesProvider value={services} />,
                    <ComicViewer {...{ entry, fileSystem, viewerState }} className={'test-class'} />,
                );
            };
            await act(async () => {
                render(<Component />, { container });
                await immediate();
            });
            const comicViewer = container.getElementsByClassName(styles.comicViewer)[0];
            expect(comicViewer.classList.contains('test-class')).toBe(true);
        });
    });
});
