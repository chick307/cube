import { act, cleanup, render } from '@testing-library/react';

import { createEntryMap } from '../../../../common/entities/entry.test-helper';
import { DummyFileSystem } from '../../../../common/entities/file-system.test-helper';
import { immediate } from '../../../../common/utils/immediate';
import { Point } from '../../../../common/values/point';
import { BinaryViewerState } from '../../../../common/values/viewer-state';
import type { HistoryController } from '../../../controllers/history-controller';
import { createHistoryController } from '../../../controllers/history-controller.test-helper';
import type { BinaryViewerControllerFactory } from '../../../factories/viewer-controller-factory';
import { ServicesProvider } from '../../../hooks/use-service';
import { composeElements } from '../../../utils/compose-elements';
import type {
    BinaryViewerController,
    BinaryViewerControllerBlockState,
} from '../../../viewer-controllers/binary-viewer-controller';
import { createBinaryViewerController } from '../../../viewer-controllers/binary-viewer-controller.test-helper';
import { BinaryViewer } from '../binary-viewer';
import styles from './binary-viewer.module.css';

const entries = createEntryMap([
    '/a',
]);

const fileSystem = new DummyFileSystem();

let services: {
    $viewerController: BinaryViewerController;

    historyController: HistoryController;

    viewerControllerFactory: BinaryViewerControllerFactory;
};

let controller: {
    setBlocks(blocks: BinaryViewerControllerBlockState[]): Promise<void>;

    setBuffer(buffer: Buffer): Promise<void>;

    setScrollPosition(position: Point): Promise<void>;
};

let container: HTMLElement;

const offsetParentDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent')!;

beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    const {
        binaryViewerController: $viewerController,
        binaryViewerControllerRestate,
    } = createBinaryViewerController();

    const { historyController } = createHistoryController();

    const viewerControllerFactory: BinaryViewerControllerFactory = {
        createBinaryViewerController: () => $viewerController,
    };

    controller = {
        setBlocks: (blocks) => binaryViewerControllerRestate.update((state) => ({ ...state, blocks })),
        setBuffer: (buffer) => binaryViewerControllerRestate.update((state) => ({ ...state, buffer })),
        setScrollPosition: (position) =>
            binaryViewerControllerRestate.update((state) => ({ ...state, scrollPosition: position })),
    };

    services = {
        $viewerController,
        historyController,
        viewerControllerFactory,
    };

    jest.useFakeTimers();

    Object.defineProperty(HTMLElement.prototype, 'scrollTo', { configurable: true, value: jest.fn() });
});

afterEach(() => {
    cleanup();
    container.remove();
    container = null!;

    services = null!;
    controller = null!;

    jest.clearAllTimers();
    jest.useRealTimers();

    Reflect.deleteProperty(HTMLElement.prototype, 'scrollTo');

    Object.defineProperty(HTMLElement.prototype, 'offsetParent', offsetParentDescriptor);
});

describe('BinaryViewer component', () => {
    test('it displays the binary', async () => {
        const initialize = jest.spyOn(services.$viewerController, 'initialize');
        const entry = entries.get('/a')!;
        const viewerState = new BinaryViewerState();
        const Component = () => {
            return composeElements(
                <ServicesProvider value={services} />,
                <BinaryViewer {...{ entry, fileSystem, viewerState }} />,
            );
        };
        await act(async () => {
            render(<Component />, { container });
            await immediate();
        });
        expect(initialize).toHaveBeenCalledWith({ entry, fileSystem, viewerState });
        await act(async () => {
            await controller.setBuffer(Buffer.from([0, 1, 2, 3, 4]));
            await controller.setBlocks([
                { blockEnd: 5, blockStart: 0, codePoints: [0, 1, 2, 3, 4], id: 'block-a' },
            ]);
        });
        const blocks = Array.from(container.getElementsByClassName(styles.block));
        expect(blocks.length).toBe(1);
        expect(blocks[0].textContent).toBe('');
    });

    test('it changes the column count if the window resized', async () => {
        Object.defineProperty(HTMLElement.prototype, 'offsetParent', { configurable: true, value: container });
        const ResizeObserver = jest.spyOn(global, 'ResizeObserver');
        const entry = entries.get('/a')!;
        const viewerState = new BinaryViewerState();
        const Component = () => {
            return composeElements(
                <ServicesProvider value={services} />,
                <BinaryViewer {...{ entry, fileSystem, viewerState }} />,
            );
        };
        await act(async () => {
            render(<Component />, { container });
            await controller.setBuffer(Buffer.from([0, 1, 2, 3, 4]));
            await controller.setBlocks([
                { blockEnd: 5, blockStart: 0, codePoints: [0, 1, 2, 3, 4], id: 'block-a' },
            ]);
        });
        const paddingElement = container.getElementsByClassName(styles.elementForMeasuringPadding)[0] as HTMLElement;
        const [
            wideBinaryContents,
            binaryContents,
        ] = Array.from(container.getElementsByClassName(styles.binaryContents)) as HTMLElement[];
        const blocks = Array.from(container.getElementsByClassName(styles.block)) as HTMLElement[];
        expect(blocks[0].style.getPropertyValue('--column-count')).toBe('1');
        jest.spyOn(container, 'getBoundingClientRect').mockReturnValue({ width: 580 } as any);
        jest.spyOn(paddingElement, 'getBoundingClientRect').mockReturnValue({ width: 40 } as any);
        jest.spyOn(wideBinaryContents, 'getBoundingClientRect').mockReturnValue({ width: 360 } as any);
        jest.spyOn(binaryContents, 'getBoundingClientRect').mockReturnValue({ width: 180 } as any);
        const resize = async () => {
            const callback = ResizeObserver.mock.calls[ResizeObserver.mock.calls.length - 1][0];
            callback([] as any, {} as any);
            await immediate();
        };
        await act(resize);
        expect(blocks[0].style.getPropertyValue('--column-count')).toBe('2');
        jest.spyOn(wideBinaryContents, 'getBoundingClientRect').mockReturnValue({ width: 540 } as any);
        jest.spyOn(binaryContents, 'getBoundingClientRect').mockReturnValue({ width: 360 } as any);
        await act(resize);
        expect(blocks[0].style.getPropertyValue('--column-count')).toBe('3');
        jest.spyOn(container, 'getBoundingClientRect').mockReturnValue({ width: 219 } as any);
        jest.spyOn(wideBinaryContents, 'getBoundingClientRect').mockReturnValue({ width: 720 } as any);
        jest.spyOn(binaryContents, 'getBoundingClientRect').mockReturnValue({ width: 540 } as any);
        await act(resize);
        expect(blocks[0].style.getPropertyValue('--column-count')).toBe('2');
        jest.spyOn(wideBinaryContents, 'getBoundingClientRect').mockReturnValue({ width: 360 } as any);
        jest.spyOn(binaryContents, 'getBoundingClientRect').mockReturnValue({ width: 180 } as any);
        await act(resize);
        expect(blocks[0].style.getPropertyValue('--column-count')).toBe('1');
    });

    test('it displays the binary blocks that are in the viewport', async () => {
        const IntersectionObserver = jest.spyOn(global, 'IntersectionObserver');
        const entry = entries.get('/a')!;
        const viewerState = new BinaryViewerState();
        const Component = () => {
            return composeElements(
                <ServicesProvider value={services} />,
                <BinaryViewer {...{ entry, fileSystem, viewerState }} />,
            );
        };
        await act(async () => {
            render(<Component />, { container });
            await controller.setBuffer(Buffer.from([0, 1, 2, 3, 4]));
            await controller.setBlocks([
                { blockEnd: 5, blockStart: 0, codePoints: [0, 1, 2, 3, 4], id: 'block-a' },
            ]);
        });
        const blocks = Array.from(container.getElementsByClassName(styles.block));
        expect(blocks[0].textContent).toBe('');
        await act(async () => {
            const callback = IntersectionObserver.mock.calls[IntersectionObserver.mock.calls.length - 1][0];
            callback([{ target: blocks[0], isIntersecting: true }] as any, {} as any);
            await immediate();
        });
        expect(blocks[0].textContent).toMatch(/00\s*01\s*02\s*03\s*04/);
        await act(async () => {
            const callback = IntersectionObserver.mock.calls[IntersectionObserver.mock.calls.length - 1][0];
            callback([{ target: blocks[0], isIntersecting: false }] as any, {} as any);
            await immediate();
        });
        expect(blocks[0].textContent).toBe('');
    });

    describe('className property', () => {
        test('it sets a class name to the component', async () => {
            const entry = entries.get('/a')!;
            const viewerState = new BinaryViewerState();
            const Component = () => {
                return composeElements(
                    <ServicesProvider value={services} />,
                    <BinaryViewer {...{ entry, fileSystem, viewerState }} className={'test-class'} />,
                );
            };
            await act(async () => {
                render(<Component />, { container });
                await immediate();
            });
            const binaryViewer = container.getElementsByClassName(styles.binaryViewer)[0];
            expect(binaryViewer.classList.contains('test-class')).toBe(true);
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
        });

        afterEach(() => {
            Object.defineProperty(HTMLElement.prototype, 'offsetParent', offsetParentPropertyDescriptor);

            Reflect.deleteProperty(container, 'scrollTo');
        });

        test('it saves the scroll position after scrolled', async () => {
            const scrollTo = jest.spyOn(services.$viewerController, 'scrollTo');
            const entry = entries.get('/a')!;
            const viewerState = new BinaryViewerState();
            const Component = () => {
                return composeElements(
                    <ServicesProvider value={services} />,
                    <BinaryViewer {...{ entry, fileSystem, viewerState }} />,
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
            const entry = entries.get('/a')!;
            const viewerState = new BinaryViewerState({ scrollPosition: new Point(100, 200) });
            const Component = () => {
                return composeElements(
                    <ServicesProvider value={services} />,
                    <BinaryViewer {...{ entry, fileSystem, viewerState }} />,
                );
            };
            await act(async () => {
                await controller.setScrollPosition(new Point(100, 200));
                render(<Component />, { container });
            });
            expect(scrollTo).not.toHaveBeenCalled();
            await act(async () => {
                await controller.setBuffer(Buffer.from([0, 1, 2, 3, 4]));
                await controller.setBlocks([
                    { blockEnd: 5, blockStart: 0, codePoints: [0, 1, 2, 3, 4], id: 'block-a' },
                ]);
            });
            expect(scrollTo).toHaveBeenCalledTimes(1);
            expect(scrollTo).toHaveBeenCalledWith(100, 200);
        });
    });
});
