import { act, cleanup, fireEvent, render } from '@testing-library/react';

import { createEntryMap } from '../../../common/entities/entry.test-helper';
import { DummyFileSystem } from '../../../common/entities/file-system.test-helper';
import { immediate } from '../../../common/utils/immediate';
import { Restate } from '../../../common/utils/restate';
import { Point } from '../../../common/values/point';
import { ImageViewerState } from '../../../common/values/viewer-state';
import type { HistoryController } from '../../controllers/history-controller';
import { createHistoryController } from '../../controllers/history-controller.test-helper';
import type { ImageViewerControllerFactory } from '../../factories/viewer-controller-factory';
import { ServicesProvider } from '../../hooks/use-service';
import type { EntryService } from '../../services/entry-service';
import { createEntryService } from '../../services/entry-service.test-helper';
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

    historyController: HistoryController;

    viewerControllerFactory: ImageViewerControllerFactory;
};

let controller: {
    setBlob: (blob: Blob) => Promise<void>;
    setScrollPosition: (scrollPosition: Point) => Promise<void>;
};

let container: HTMLElement;

beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    const { entryService } = createEntryService();

    const { historyController } = createHistoryController();

    const viewerControllerFactory: ImageViewerControllerFactory = {
        createImageViewerController: () => $viewerController,
    };

    const imageViewerControllerRestate = new Restate<ImageViewerControllerState>({
        blob: null,
        scrollPosition: Point.zero,
    });

    const $viewerController: ImageViewerController = {
        state: imageViewerControllerRestate.state,
        initialize: () => {},
        scrollTo: () => {},
    };

    controller = {
        setBlob: (blob) => imageViewerControllerRestate.update((state) => ({ ...state, blob })),
        setScrollPosition: (position) =>
            imageViewerControllerRestate.update((state) => ({ ...state, scrollPosition: position })),
    };

    services = {
        $viewerController,
        entryService,
        historyController,
        viewerControllerFactory,
    };

    jest.useFakeTimers();
});

afterEach(() => {
    cleanup();
    container.remove();
    container = null!;

    services = null!;
    controller = null!;

    jest.clearAllTimers();
    jest.useRealTimers();
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
        await act(async () => {
            render(<Component />, { container });
            await immediate();
        });
        expect(initialize).toHaveBeenCalledTimes(1);
        expect(initialize).toHaveBeenCalledWith({ entry, fileSystem, viewerState });
        expect(container.getElementsByClassName(styles.image).length).toBe(0);
        await act(async () => {
            await controller.setBlob(new Blob(['<svg />'], { type: 'image/svg+xml' }));
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
            await act(async () => {
                render(<Component />, { container });
                await immediate();
            });
            const imageViewer = container.getElementsByClassName(styles.imageViewer)[0];
            expect(imageViewer.classList.contains('test-class')).toBe(true);
        });
    });

    describe('if rendered in a scrollable element', () => {
        const offsetParentPropertyDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent')!;

        beforeEach(() => {
            Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
                configurable: true,
                enumerable: true,
                value: container,
                writable: false,
            });

            container.scrollTo = () => {};
        });

        afterEach(() => {
            Object.defineProperty(HTMLElement.prototype, 'offsetParent', offsetParentPropertyDescriptor);

            Reflect.deleteProperty(container, 'scrollTo');
        });

        test('it saves the scroll position after scrolled', async () => {
            const scrollTo = jest.spyOn(services.$viewerController, 'scrollTo');
            const entry = entries.get('/a.svg')!;
            const viewerState = new ImageViewerState();
            const Component = () => {
                return composeElements(
                    <ServicesProvider value={services} />,
                    <ImageViewer {...{ entry, fileSystem, viewerState }} />,
                );
            };
            await act(async () => {
                render(<Component />, { container });
                await immediate();
            });
            container.scrollLeft = 50;
            container.scrollTop = 150;
            container.dispatchEvent(new UIEvent('scroll'));
            jest.advanceTimersByTime(10);
            expect(scrollTo).not.toHaveBeenCalled();
            container.scrollLeft = 100;
            container.scrollTop = 200;
            container.dispatchEvent(new UIEvent('scroll'));
            jest.advanceTimersByTime(100);
            expect(scrollTo).toHaveBeenCalledTimes(1);
            expect(scrollTo).toHaveBeenCalledWith({ position: new Point(100, 200) });
        });

        test('it restores the scroll position after rendered', async () => {
            const scrollTo = jest.spyOn(container, 'scrollTo');
            const entry = entries.get('/a.svg')!;
            const viewerState = new ImageViewerState({ scrollPosition: new Point(100, 200) });
            const Component = () => {
                return composeElements(
                    <ServicesProvider value={services} />,
                    <ImageViewer {...{ entry, fileSystem, viewerState }} />,
                );
            };
            await act(async () => {
                await controller.setScrollPosition(new Point(100, 200));
                render(<Component />, { container });
            });
            await act(async () => {
                await controller.setBlob(new Blob(['<svg />'], { type: 'image/svg+xml' }));
            });
            const images = Array.from(container.getElementsByClassName(styles.image));
            expect(images).toEqual([expect.any(HTMLImageElement)]);
            expect(scrollTo).not.toHaveBeenCalled();
            fireEvent.load(images[0]);
            expect(scrollTo).toHaveBeenCalledTimes(1);
            expect(scrollTo).toHaveBeenCalledWith(100, 200);
        });
    });
});
