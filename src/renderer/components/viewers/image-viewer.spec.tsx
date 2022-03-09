import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import { createEntryMap } from '../../../common/entities/entry.test-helper';
import { DummyFileSystem } from '../../../common/entities/file-system.test-helper';
import { immediate } from '../../../common/utils/immediate';
import { Restate } from '../../../common/utils/restate';
import { ImageViewerState } from '../../../common/values/viewer-state';
import type { HistoryController } from '../../controllers/history-controller';
import { createHistoryController } from '../../controllers/history-controller.test-helper';
import type { ImageViewerControllerFactory } from '../../factories/viewer-controller-factory';
import { ServicesProvider } from '../../hooks/use-service';
import type { EntryIconService } from '../../services/entry-icon-service';
import { createEntryIconService } from '../../services/entry-icon-service.test-helper';
import type { EntryService } from '../../services/entry-service';
import { createEntryService } from '../../services/entry-service.test-helper';
import type { LocalEntryService } from '../../services/local-entry-service';
import { createLocalEntryService } from '../../services/local-entry-service.test-helper';
import { composeElements } from '../../utils/compose-elements';
import type {
    ImageViewerController,
    ImageViewerControllerState,
} from '../../viewer-controllers/image-viewer-controller';
import { ImageViewer } from './image-viewer';
import styles from './image-viewer.module.css';

const entries = createEntryMap([
    '/a.svg',
]);

const fileSystem = new DummyFileSystem();

let services: {
    $viewerController: ImageViewerController;

    entryService: EntryService;

    entryIconService: EntryIconService;

    historyController: HistoryController;

    localEntryService: LocalEntryService;

    viewerControllerFactory: ImageViewerControllerFactory;
};

let controllers: {
    restate: Restate<ImageViewerControllerState>;
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

    const viewerControllerFactory: ImageViewerControllerFactory = {
        createImageViewerController: () => $viewerController,
    };

    const restate = new Restate<ImageViewerControllerState>({
        blob: null,
    });

    const $viewerController: ImageViewerController = {
        state: restate.state,
        initialize: () => {},
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
    ReactDom.unmountComponentAtNode(container);
    container.remove();
    container = null!;

    services = null!;
    controllers = null!;
});

describe('ImageViewer component', () => {
    test('it displays the symbolic link', async () => {
        const initialize = jest.spyOn(services.$viewerController, 'initialize');
        const entry = entries.get('/a.svg')!;
        const viewerState = new ImageViewerState();
        const Component = () => {
            return composeElements(
                <ServicesProvider value={services} />,
                <ImageViewer {...{ entry, fileSystem, viewerState }} />,
            );
        };
        await TestUtils.act(async () => {
            ReactDom.render(<Component />, container);
            await immediate();
        });
        expect(initialize).toHaveBeenCalledTimes(1);
        expect(initialize).toHaveBeenCalledWith({ entry, fileSystem, viewerState });
        expect(container.getElementsByClassName(styles.image).length).toBe(0);
        await TestUtils.act(async () => {
            await controllers.restate.update((state) => {
                return {
                    ...state,
                    blob: new Blob(['<svg />'], { type: 'image/svg+xml' }),
                };
            });
        });
        const images = Array.from(container.getElementsByClassName(styles.image));
        expect(images).toEqual([expect.any(HTMLImageElement)]);
    });

    describe('className property', () => {
        test('it sets a class name to the image link viewer', async () => {
            const entry = entries.get('/a.svg')!;
            const viewerState = new ImageViewerState();
            const Component = () => {
                return composeElements(
                    <ServicesProvider value={services} />,
                    <ImageViewer {...{ entry, fileSystem, viewerState }} className={'test-class'} />,
                );
            };
            await TestUtils.act(async () => {
                ReactDom.render(<Component />, container);
                await immediate();
            });
            const imageViewer = container.getElementsByClassName(styles.imageViewer)[0];
            expect(imageViewer.classList.contains('test-class')).toBe(true);
        });
    });
});
