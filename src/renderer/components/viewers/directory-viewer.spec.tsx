import { act, cleanup, fireEvent, render } from '@testing-library/react';

import { createEntryMap } from '../../../common/entities/entry.test-helper';
import { DummyFileSystem } from '../../../common/entities/file-system.test-helper';
import { immediate } from '../../../common/utils/immediate';
import { Restate } from '../../../common/utils/restate';
import { DirectoryViewerState } from '../../../common/values/viewer-state';
import type { HistoryController } from '../../controllers/history-controller';
import { createHistoryController } from '../../controllers/history-controller.test-helper';
import type { DirectoryViewerControllerFactory } from '../../factories/viewer-controller-factory';
import { useStatusBar } from '../../gateways/status-bar-gateway';
import { createContextMenuService } from '../../hooks/use-context-menu.test-helper';
import { ServicesProvider } from '../../hooks/use-service';
import type { ContextMenuService } from '../../services/context-menu-service';
import type { EntryIconService } from '../../services/entry-icon-service';
import { createEntryIconService } from '../../services/entry-icon-service.test-helper';
import type { EntryService } from '../../services/entry-service';
import { createEntryService } from '../../services/entry-service.test-helper';
import type { LocalEntryService } from '../../services/local-entry-service';
import { createLocalEntryService } from '../../services/local-entry-service.test-helper';
import type {
    DirectoryViewerController,
    DirectoryViewerControllerState,
} from '../../viewer-controllers/directory-viewer-controller';
import { DirectoryViewer } from './directory-viewer';
import styles from './directory-viewer.module.css';

const entries = createEntryMap([
    '/a/',
    '/a/a1',
    '/a/a2',
    '/home',
]);

const fileSystem = new DummyFileSystem();

let services: {
    $viewerController: DirectoryViewerController;

    contextMenuService: ContextMenuService;

    entryService: EntryService;

    entryIconService: EntryIconService;

    historyController: HistoryController;

    localEntryService: LocalEntryService;

    viewerControllerFactory: DirectoryViewerControllerFactory;
};

let controllers: {
    clickContextMenuItem: (params: {
        element: HTMLElement;
        menuItemId: string;
    }) => void;
    restate: Restate<DirectoryViewerControllerState>;
};

let container: HTMLElement;

beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    const { contextMenuService, clickContextMenuItem } = createContextMenuService();

    const { entryIconService } = createEntryIconService();

    const { entryService } = createEntryService();

    const { historyController } = createHistoryController();

    const { localEntryService } = createLocalEntryService();

    const viewerControllerFactory: DirectoryViewerControllerFactory = {
        createDirectoryViewerController: () => $viewerController,
    };

    const restate = new Restate<DirectoryViewerControllerState>({
        hiddenEntryCount: 'no item',
        hiddenEntryVisible: false,
        itemCount: 'no item',
        items: [],
        randomItemOpenable: false,
    });

    const $viewerController: DirectoryViewerController = {
        state: restate.state,
        initialize: () => {},
        openItem: () => {},
        openRandomItem: () => {},
        toggleHiddenEntryVisible: () => {},
    };

    controllers = {
        clickContextMenuItem,
        restate,
    };

    services = {
        $viewerController,
        contextMenuService,
        entryIconService,
        entryService,
        historyController,
        localEntryService,
        viewerControllerFactory,
    };
});

afterEach(() => {
    cleanup();
    container.remove();
    container = null!;

    services = null!;
    controllers = null!;
});

describe('DirectoryViewer component', () => {
    test('it displays the directory items', async () => {
        const initialize = jest.spyOn(services.$viewerController, 'initialize');
        const entry = entries.get('/a')!;
        const viewerState = new DirectoryViewerState();
        const Component = () => {
            const { StatusBarExit, StatusBarProvider } = useStatusBar();
            return (
                <div>
                    <ServicesProvider value={services}>
                        <StatusBarProvider>
                            <DirectoryViewer {...{ entry, fileSystem, viewerState }} />
                        </StatusBarProvider>
                        <div className={'test-status-bar'}>
                            <StatusBarExit />
                        </div>
                    </ServicesProvider>
                </div>
            );
        };
        await act(async () => {
            render(<Component />, { container });
            await immediate();
        });
        expect(initialize).toHaveBeenCalledTimes(1);
        expect(initialize).toHaveBeenCalledWith({ entry, fileSystem, viewerState });
        expect(container.getElementsByClassName(styles.list).length).toBe(1);
        expect(container.getElementsByClassName(styles.listItem).length).toBe(0);
        expect(container.getElementsByClassName(styles.itemCount).length).toBe(1);
        expect(container.getElementsByClassName(styles.itemCount)[0]?.textContent).toBe('no item');
        await act(async () => {
            await controllers.restate.update((state) => {
                return {
                    ...state,
                    itemCount: '2 items',
                    items: [
                        { entry: entries.get('/a/a1')!, id: '0' },
                        { entry: entries.get('/a/a2')!, id: '1' },
                    ],
                };
            });
        });
        expect(container.getElementsByClassName(styles.list).length).toBe(1);
        const listItems = container.getElementsByClassName(styles.listItem);
        expect(listItems.length).toBe(2);
        expect(listItems[0].getElementsByClassName(styles.entryName).length).toBe(1);
        expect(listItems[0].getElementsByClassName(styles.entryName)[0].textContent).toBe('a1');
        expect(listItems[1].getElementsByClassName(styles.entryName).length).toBe(1);
        expect(listItems[1].getElementsByClassName(styles.entryName)[0].textContent).toBe('a2');
        expect(container.getElementsByClassName(styles.itemCount).length).toBe(1);
        expect(container.getElementsByClassName(styles.itemCount)[0]?.textContent).toBe('2 items');
    });

    test('it opens the directory items when double-clicked', async () => {
        const openItem = jest.spyOn(services.$viewerController, 'openItem');
        const entry = entries.get('/a')!;
        const viewerState = new DirectoryViewerState();
        const Component = () => {
            const { StatusBarExit, StatusBarProvider } = useStatusBar();
            return (
                <div>
                    <ServicesProvider value={services}>
                        <StatusBarProvider>
                            <DirectoryViewer {...{ entry, fileSystem, viewerState }} />
                        </StatusBarProvider>
                        <div className={'test-status-bar'}>
                            <StatusBarExit />
                        </div>
                    </ServicesProvider>
                </div>
            );
        };
        await act(async () => {
            render(<Component />, { container });
            await controllers.restate.update((state) => {
                return {
                    ...state,
                    itemCount: '2 items',
                    items: [
                        { entry: entries.get('/a/a1')!, id: '0' },
                        { entry: entries.get('/a/a2')!, id: '1' },
                    ],
                };
            });
        });
        const listItems = container.getElementsByClassName(styles.listItem) as HTMLCollectionOf<HTMLElement>;
        expect(listItems.length).toBe(2);
        fireEvent.doubleClick(listItems[0]);
        expect(openItem).toHaveBeenCalledTimes(1);
        expect(openItem).toHaveBeenCalledWith({ itemId: '0' });
    });

    test('it does nothing if out of the list items is double-clicked', async () => {
        const openItem = jest.spyOn(services.$viewerController, 'openItem');
        const entry = entries.get('/a')!;
        const viewerState = new DirectoryViewerState();
        const Component = () => {
            const { StatusBarExit, StatusBarProvider } = useStatusBar();
            return (
                <div>
                    <ServicesProvider value={services}>
                        <StatusBarProvider>
                            <DirectoryViewer {...{ entry, fileSystem, viewerState }} />
                        </StatusBarProvider>
                        <div className={'test-status-bar'}>
                            <StatusBarExit />
                        </div>
                    </ServicesProvider>
                </div>
            );
        };
        await act(async () => {
            render(<Component />, { container });
            await controllers.restate.update((state) => {
                return {
                    ...state,
                    itemCount: '2 items',
                    items: [
                        { entry: entries.get('/a/a1')!, id: '0' },
                        { entry: entries.get('/a/a2')!, id: '1' },
                    ],
                };
            });
        });
        const list = container.getElementsByClassName(styles.list)[0];
        fireEvent.doubleClick(list);
        expect(openItem).not.toHaveBeenCalled();
    });

    test('it opens a random item if context menu item clicked', async () => {
        const openRandomItem = jest.spyOn(services.$viewerController, 'openRandomItem');
        const entry = entries.get('/a')!;
        const viewerState = new DirectoryViewerState();
        const Component = () => {
            const { StatusBarExit, StatusBarProvider } = useStatusBar();
            return (
                <div>
                    <ServicesProvider value={services}>
                        <StatusBarProvider>
                            <DirectoryViewer {...{ entry, fileSystem, viewerState }} />
                        </StatusBarProvider>
                        <div className={'test-status-bar'}>
                            <StatusBarExit />
                        </div>
                    </ServicesProvider>
                </div>
            );
        };
        await act(async () => {
            render(<Component />, { container });
            await controllers.restate.update((state) => {
                return {
                    ...state,
                    itemCount: '2 items',
                    items: [
                        { entry: entries.get('/a/a1')!, id: '0' },
                        { entry: entries.get('/a/a2')!, id: '1' },
                    ],
                };
            });
        });
        const itemCount = container.getElementsByClassName(styles.itemCount)[0] as HTMLElement;
        controllers.clickContextMenuItem({ element: itemCount, menuItemId: 'openRandomItem' });
        expect(openRandomItem).toHaveBeenCalledTimes(1);
    });

    test('it toggles the hidden entries visible if context menu item clicked', async () => {
        const toggleHiddenEntryVisible = jest.spyOn(services.$viewerController, 'toggleHiddenEntryVisible');
        const entry = entries.get('/a')!;
        const viewerState = new DirectoryViewerState();
        const Component = () => {
            const { StatusBarExit, StatusBarProvider } = useStatusBar();
            return (
                <div>
                    <ServicesProvider value={services}>
                        <StatusBarProvider>
                            <DirectoryViewer {...{ entry, fileSystem, viewerState }} />
                        </StatusBarProvider>
                        <div className={'test-status-bar'}>
                            <StatusBarExit />
                        </div>
                    </ServicesProvider>
                </div>
            );
        };
        await act(async () => {
            render(<Component />, { container });
            await controllers.restate.update((state) => {
                return {
                    ...state,
                    itemCount: '2 items',
                    items: [
                        { entry: entries.get('/a/a1')!, id: '0' },
                        { entry: entries.get('/a/a2')!, id: '1' },
                    ],
                };
            });
        });
        const itemCount = container.getElementsByClassName(styles.itemCount)[0] as HTMLElement;
        controllers.clickContextMenuItem({ element: itemCount, menuItemId: 'toggleHiddenEntryVisible' });
        expect(toggleHiddenEntryVisible).toHaveBeenCalledTimes(1);
    });

    describe('className property', () => {
        test('it sets a class name to the directory viewer', async () => {
            const entry = entries.get('/a')!;
            const viewerState = new DirectoryViewerState();
            const Component = () => {
                const { StatusBarExit, StatusBarProvider } = useStatusBar();
                return (
                    <div>
                        <ServicesProvider value={services}>
                            <StatusBarProvider>
                                <DirectoryViewer {...{ entry, fileSystem, viewerState }} className={'test-class'} />
                            </StatusBarProvider>
                            <div className={'test-status-bar'}>
                                <StatusBarExit />
                            </div>
                        </ServicesProvider>
                    </div>
                );
            };
            await act(async () => {
                render(<Component />, { container });
                await immediate();
            });
            expect(container.getElementsByClassName(styles.directoryViewer).length).toBe(1);
            const directoryViewer = container.getElementsByClassName(styles.directoryViewer)[0];
            expect(directoryViewer.classList.contains('test-class')).toBe(true);
        });
    });
});
