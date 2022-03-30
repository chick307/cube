import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import type { Root } from 'hast';
import { h } from 'hastscript';

import { createEntryMap } from '../../../common/entities/entry.test-helper';
import { DummyFileSystem } from '../../../common/entities/file-system.test-helper';
import { immediate } from '../../../common/utils/immediate';
import { Point } from '../../../common/values/point';
import { TextViewerState } from '../../../common/values/viewer-state';
import type { HistoryController } from '../../controllers/history-controller';
import { createHistoryController } from '../../controllers/history-controller.test-helper';
import { TabController } from '../../controllers/tab-controller';
import { createTabController } from '../../controllers/tab-controller.test-helper';
import type { TextViewerControllerFactory } from '../../factories/viewer-controller-factory';
import { ServicesProvider } from '../../hooks/use-service';
import type { EntryIconService } from '../../services/entry-icon-service';
import { createEntryIconService } from '../../services/entry-icon-service.test-helper';
import type { EntryService } from '../../services/entry-service';
import { createEntryService } from '../../services/entry-service.test-helper';
import type { LocalEntryService } from '../../services/local-entry-service';
import { createLocalEntryService } from '../../services/local-entry-service.test-helper';
import { composeElements } from '../../utils/compose-elements';
import type { TextViewerController } from '../../viewer-controllers/text-viewer-controller';
import { createTextViewerController } from '../../viewer-controllers/text-viewer-controller.test-helper';
import { TextViewer } from './text-viewer';
import styles from './text-viewer.module.css';

const entries = createEntryMap([
    '/a.txt',
]);

const fileSystem = new DummyFileSystem();

let services: {
    $viewerController: TextViewerController;

    entryService: EntryService;

    entryIconService: EntryIconService;

    historyController: HistoryController;

    tabController: TabController;

    localEntryService: LocalEntryService;

    viewerControllerFactory: TextViewerControllerFactory;
};

let controller: {
    setLines(trees: Root[]): Promise<void>;

    setScrollPosition(position: Point): Promise<void>;
};

let container: HTMLElement;

beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    const {
        textViewerController: $viewerController,
        textViewerControllerRestate,
    } = createTextViewerController();

    const { entryIconService } = createEntryIconService();

    const { entryService } = createEntryService();

    const { historyController } = createHistoryController();

    const { localEntryService } = createLocalEntryService();

    const { tabController } = createTabController();

    const viewerControllerFactory: TextViewerControllerFactory = {
        createTextViewerController: () => $viewerController,
    };

    controller = {
        setLines: (trees) => textViewerControllerRestate.update((state) => {
            const lines = trees.map((tree, index) => ({ lineNumber: index + 1, tree }));
            return { ...state, lines };
        }),
        setScrollPosition: (position) =>
            textViewerControllerRestate.update((state) => ({ ...state, scrollPosition: position })),
    };

    services = {
        $viewerController,
        entryIconService,
        entryService,
        historyController,
        localEntryService,
        tabController,
        viewerControllerFactory,
    };

    jest.useFakeTimers();
});

afterEach(() => {
    ReactDom.unmountComponentAtNode(container);
    container.remove();
    container = null!;

    services = null!;
    controller = null!;

    jest.clearAllTimers();
    jest.useRealTimers();
});

describe('TextViewer component', () => {
    test('it displays the text', async () => {
        const initialize = jest.spyOn(services.$viewerController, 'initialize');
        const entry = entries.get('/a.txt')!;
        const viewerState = new TextViewerState();
        const Component = () => {
            return composeElements(
                <ServicesProvider value={services} />,
                <TextViewer {...{ entry, fileSystem, viewerState }} />,
            );
        };
        await TestUtils.act(async () => {
            ReactDom.render(<Component />, container);
            await immediate();
        });
        expect(initialize).toHaveBeenCalledWith({ entry, fileSystem, viewerState });
        expect(container.getElementsByTagName('h1').length).toBe(0);
        await TestUtils.act(async () => {
            await controller.setLines([h(null, 'Hello, TextViewer!')]);
        });
        expect(container.textContent).toBe('1Hello, TextViewer!');
    });

    describe('className property', () => {
        test('it sets a class name to the component', async () => {
            const entry = entries.get('/a.txt')!;
            const viewerState = new TextViewerState();
            const Component = () => {
                return composeElements(
                    <ServicesProvider value={services} />,
                    <TextViewer {...{ entry, fileSystem, viewerState }} className={'test-class'} />,
                );
            };
            await TestUtils.act(async () => {
                ReactDom.render(<Component />, container);
                await immediate();
            });
            const textViewer = container.getElementsByClassName(styles.textViewer)[0];
            expect(textViewer.classList.contains('test-class')).toBe(true);
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
            const entry = entries.get('/a.txt')!;
            const viewerState = new TextViewerState();
            const Component = () => {
                return composeElements(
                    <ServicesProvider value={services} />,
                    <TextViewer {...{ entry, fileSystem, viewerState }} />,
                );
            };
            await TestUtils.act(async () => {
                ReactDom.render(<Component />, container);
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
            const entry = entries.get('/a.txt')!;
            const viewerState = new TextViewerState({ scrollPosition: new Point(100, 200) });
            const Component = () => {
                return composeElements(
                    <ServicesProvider value={services} />,
                    <TextViewer {...{ entry, fileSystem, viewerState }} />,
                );
            };
            await TestUtils.act(async () => {
                await controller.setScrollPosition(new Point(100, 200));
                ReactDom.render(<Component />, container);
            });
            expect(scrollTo).not.toHaveBeenCalled();
            await TestUtils.act(async () => {
                await controller.setLines([h(null, h('div'))]);
            });
            expect(scrollTo).toHaveBeenCalledTimes(1);
            expect(scrollTo).toHaveBeenCalledWith(100, 200);
        });
    });
});
