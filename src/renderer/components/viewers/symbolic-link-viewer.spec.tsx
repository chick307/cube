import { act, cleanup, fireEvent, render } from '@testing-library/react';

import { SymbolicLinkEntry } from '../../../common/entities/entry';
import { createEntryMap } from '../../../common/entities/entry.test-helper';
import { DummyFileSystem } from '../../../common/entities/file-system.test-helper';
import { immediate } from '../../../common/utils/immediate';
import { Restate } from '../../../common/utils/restate';
import { EntryPath } from '../../../common/values/entry-path';
import { SymbolicLinkViewerState } from '../../../common/values/viewer-state';
import type { HistoryController } from '../../controllers/history-controller';
import { createHistoryController } from '../../controllers/history-controller.test-helper';
import type { SymbolicLinkViewerControllerFactory } from '../../factories/viewer-controller-factory';
import { ServicesProvider } from '../../hooks/use-service';
import type { EntryIconService } from '../../services/entry-icon-service';
import { createEntryIconService } from '../../services/entry-icon-service.test-helper';
import type { EntryService } from '../../services/entry-service';
import { createEntryService } from '../../services/entry-service.test-helper';
import type { LocalEntryService } from '../../services/local-entry-service';
import { createLocalEntryService } from '../../services/local-entry-service.test-helper';
import type {
    SymbolicLinkViewerController,
    SymbolicLinkViewerControllerState,
} from '../../viewer-controllers/symbolic-link-viewer-controller';
import { SymbolicLinkViewer } from './symbolic-link-viewer';
import styles from './symbolic-link-viewer.module.css';

const entries = createEntryMap([
    '/a/',
    '/a/a1',
]);

entries.set('/a/a2', new SymbolicLinkEntry(new EntryPath('/a/a2')));

const fileSystem = new DummyFileSystem();

let services: {
    $viewerController: SymbolicLinkViewerController;

    entryService: EntryService;

    entryIconService: EntryIconService;

    historyController: HistoryController;

    localEntryService: LocalEntryService;

    viewerControllerFactory: SymbolicLinkViewerControllerFactory;
};

let controllers: {
    restate: Restate<SymbolicLinkViewerControllerState>;
};

let container: HTMLElement;

beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    const { entryIconService } = createEntryIconService();

    const { entryService } = createEntryService();
    const createEntryFromPath = jest.spyOn(entryService, 'createEntryFromPath');
    createEntryFromPath.mockImplementation(async (params) => entries.get(params.entryPath.toString()) ?? null);

    const { historyController } = createHistoryController();

    const { localEntryService } = createLocalEntryService();

    const viewerControllerFactory: SymbolicLinkViewerControllerFactory = {
        createSymbolicLinkViewerController: () => $viewerController,
    };

    const restate = new Restate<SymbolicLinkViewerControllerState>({
        linkString: null,
        linkedEntry: null,
    });

    const $viewerController: SymbolicLinkViewerController = {
        state: restate.state,
        initialize: () => {},
        openLink: () => {},
    };

    controllers = {
        restate,
    };

    services = {
        $viewerController,
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

describe('SymbolicLinkViewer component', () => {
    test('it displays the symbolic link', async () => {
        const initialize = jest.spyOn(services.$viewerController, 'initialize');
        const entry = entries.get('/a/a2')!;
        const viewerState = new SymbolicLinkViewerState();
        const Component = () => {
            return (
                <div>
                    <ServicesProvider value={services}>
                        <SymbolicLinkViewer {...{ entry, fileSystem, viewerState }} />
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
        expect(container.getElementsByClassName(styles.linkString).length).toBe(0);
        expect(container.getElementsByClassName(styles.linkedEntry).length).toBe(0);
        expect(container.getElementsByClassName(styles.linkedEntryPath).length).toBe(0);
        await act(async () => {
            await controllers.restate.update((state) => {
                return {
                    ...state,
                    linkString: 'a1',
                    linkedEntry: entries.get('/a/a1')!,
                };
            });
        });
        expect(container.getElementsByClassName(styles.linkString).length).toBe(1);
        expect(container.getElementsByClassName(styles.linkString)[0].textContent).toBe('a1');
        expect(container.getElementsByClassName(styles.linkedEntry).length).toBe(1);
        expect(container.getElementsByClassName(styles.linkedEntryPath).length).toBe(1);
        expect(container.getElementsByClassName(styles.linkedEntryPath)[0].textContent).toBe('/a/a1');
    });

    test('it opens the linked entry when clicked', async () => {
        const openLink = jest.spyOn(services.$viewerController, 'openLink');
        const entry = entries.get('/a/a2')!;
        const viewerState = new SymbolicLinkViewerState();
        const Component = () => {
            return (
                <div>
                    <ServicesProvider value={services}>
                        <SymbolicLinkViewer {...{ entry, fileSystem, viewerState }} />
                    </ServicesProvider>
                </div>
            );
        };
        await act(async () => {
            render(<Component />, { container });
            await controllers.restate.update((state) => {
                return {
                    ...state,
                    linkString: 'a1',
                    linkedEntry: entries.get('/a/a1')!,
                };
            });
        });
        expect(container.getElementsByClassName(styles.linkedEntryPath).length).toBe(1);
        fireEvent.click(container.getElementsByClassName(styles.linkedEntryPath)[0]);
        expect(openLink).toHaveBeenCalledTimes(1);
    });

    describe('className property', () => {
        test('it sets a class name to the symbolic link viewer', async () => {
            const entry = entries.get('/a/a2')!;
            const viewerState = new SymbolicLinkViewerState();
            const Component = () => {
                return (
                    <div>
                        <ServicesProvider value={services}>
                            <SymbolicLinkViewer {...{ entry, fileSystem, viewerState }} className={'test-class'} />
                        </ServicesProvider>
                    </div>
                );
            };
            await act(async () => {
                render(<Component />, { container });
                await immediate();
            });
            expect(container.getElementsByClassName(styles.symbolicLinkViewer).length).toBe(1);
            const symbolicLinkViewer = container.getElementsByClassName(styles.symbolicLinkViewer)[0];
            expect(symbolicLinkViewer.classList.contains('test-class')).toBe(true);
        });
    });
});
