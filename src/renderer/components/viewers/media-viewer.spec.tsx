import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import { createEntryMap } from '../../../common/entities/entry.test-helper';
import { DummyFileSystem } from '../../../common/entities/file-system.test-helper';
import { immediate } from '../../../common/utils/immediate';
import { Restate } from '../../../common/utils/restate';
import { MediaViewerState } from '../../../common/values/viewer-state';
import type { MediaViewerControllerFactory } from '../../factories/viewer-controller-factory';
import { ServicesProvider } from '../../hooks/use-service';
import { composeElements } from '../../utils/compose-elements';
import type {
    MediaViewerController,
    MediaViewerControllerState,
} from '../../viewer-controllers/media-viewer-controller';
import { MediaViewer } from './media-viewer';
import styles from './media-viewer.module.css';

const entries = createEntryMap([
    '/a',
]);

const fileSystem = new DummyFileSystem();

let services: {
    $viewerController: MediaViewerController;

    viewerControllerFactory: MediaViewerControllerFactory;
};

let controller: {
    setBlob(blob: Blob): Promise<void>;
};

let container: HTMLElement;

beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    const viewerControllerFactory: MediaViewerControllerFactory = {
        createMediaViewerController: () => $viewerController,
    };

    const restate = new Restate<MediaViewerControllerState>({
        blob: null,
    });

    const $viewerController: MediaViewerController = {
        state: restate.state,
        initialize: () => {},
    };

    controller = {
        setBlob: (blob: Blob) => restate.update((state) => ({ ...state, blob })),
    };

    services = {
        $viewerController,
        viewerControllerFactory,
    };
});

afterEach(() => {
    ReactDom.unmountComponentAtNode(container);
    container.remove();
    container = null!;

    services = null!;
    controller = null!;
});

describe('MediaViewer component', () => {
    test('it displays the media', async () => {
        const initialize = jest.spyOn(services.$viewerController, 'initialize');
        const entry = entries.get('/a')!;
        const viewerState = new MediaViewerState();
        const Component = () => {
            return composeElements(
                <ServicesProvider value={services} />,
                <MediaViewer {...{ entry, fileSystem, viewerState }} />,
            );
        };
        await TestUtils.act(async () => {
            ReactDom.render(<Component />, container);
            await immediate();
        });
        expect(initialize).toHaveBeenCalledTimes(1);
        expect(initialize).toHaveBeenCalledWith({ entry, fileSystem, viewerState });
        expect(container.getElementsByClassName(styles.media).length).toBe(0);
        await TestUtils.act(async () => {
            await controller.setBlob(new Blob([Buffer.from([0])], { type: 'application/octet-stream' }));
        });
        const videos = Array.from(container.getElementsByClassName(styles.video));
        expect(videos).toEqual([expect.any(HTMLVideoElement)]);
    });

    describe('className property', () => {
        test('it sets a class name to the media viewer', async () => {
            const entry = entries.get('/a')!;
            const viewerState = new MediaViewerState();
            const Component = () => {
                return composeElements(
                    <ServicesProvider value={services} />,
                    <MediaViewer {...{ entry, fileSystem, viewerState }} className={'test-class'} />,
                );
            };
            await TestUtils.act(async () => {
                ReactDom.render(<Component />, container);
                await immediate();
            });
            const mediaViewer = container.getElementsByClassName(styles.mediaViewer)[0];
            expect(mediaViewer.classList.contains('test-class')).toBe(true);
        });
    });
});
