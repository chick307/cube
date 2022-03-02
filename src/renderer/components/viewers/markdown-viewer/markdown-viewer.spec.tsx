import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import type { Root } from 'hast';
import { h } from 'hastscript';

import { createEntryMap } from '../../../../common/entities/entry.test-helper';
import { DummyFileSystem } from '../../../../common/entities/file-system.test-helper';
import { immediate } from '../../../../common/utils/immediate';
import { MarkdownViewerState } from '../../../../common/values/viewer-state';
import type { HistoryController } from '../../../controllers/history-controller';
import { createHistoryController } from '../../../controllers/history-controller.test-helper';
import { TabController } from '../../../controllers/tab-controller';
import { createTabController } from '../../../controllers/tab-controller.test-helper';
import type { MarkdownViewerControllerFactory } from '../../../factories/viewer-controller-factory';
import { ServicesProvider } from '../../../hooks/use-service';
import type { EntryIconService } from '../../../services/entry-icon-service';
import { createEntryIconService } from '../../../services/entry-icon-service.test-helper';
import type { EntryService } from '../../../services/entry-service';
import { createEntryService } from '../../../services/entry-service.test-helper';
import type { LocalEntryService } from '../../../services/local-entry-service';
import { createLocalEntryService } from '../../../services/local-entry-service.test-helper';
import { composeElements } from '../../../utils/compose-elements';
import type { MarkdownViewerController } from '../../../viewer-controllers/markdown-viewer-controller';
import { createMarkdownViewerController } from '../../../viewer-controllers/markdown-viewer-controller.test-helper';
import { MarkdownViewer } from '../markdown-viewer';
import markdownBlockquoteStyles from './markdown-blockquote.module.css';
import markdownCodeStyles from './markdown-code.module.css';
import markdownImageStyles from './markdown-image.module.css';
import markdownLinkStyles from './markdown-link.module.css';
import markdownParagraphStyles from './markdown-paragraph.module.css';
import styles from './markdown-viewer.module.css';

const entries = createEntryMap([
    '/a.md',
]);

const fileSystem = new DummyFileSystem();

let services: {
    $viewerController: MarkdownViewerController;

    entryService: EntryService;

    entryIconService: EntryIconService;

    historyController: HistoryController;

    tabController: TabController;

    localEntryService: LocalEntryService;

    viewerControllerFactory: MarkdownViewerControllerFactory;
};

let controller: {
    setTree(tree: Root): Promise<void>;
};

let container: HTMLElement;

beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    const {
        markdownViewerController: $viewerController,
        markdownViewerControllerRestate,
    } = createMarkdownViewerController();

    const { entryIconService } = createEntryIconService();

    const { entryService } = createEntryService();

    const { historyController } = createHistoryController();

    const { localEntryService } = createLocalEntryService();

    const { tabController } = createTabController();

    const viewerControllerFactory: MarkdownViewerControllerFactory = {
        createMarkdownViewerController: () => $viewerController,
    };

    controller = {
        setTree: (tree) => markdownViewerControllerRestate.update((state) => ({ ...state, tree })),
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
});

afterEach(() => {
    ReactDom.unmountComponentAtNode(container);
    container.remove();
    container = null!;

    services = null!;
    controller = null!;
});

describe('MarkdownViewer component', () => {
    test('it displays the markdown', async () => {
        const initialize = jest.spyOn(services.$viewerController, 'initialize');
        const entry = entries.get('/a.md')!;
        const viewerState = new MarkdownViewerState();
        const Component = () => {
            return composeElements(
                <ServicesProvider value={services} />,
                <MarkdownViewer {...{ entry, fileSystem, viewerState }} />,
            );
        };
        await TestUtils.act(async () => {
            ReactDom.render(<Component />, container);
            await immediate();
        });
        expect(initialize).toHaveBeenCalledWith({ entry, fileSystem, viewerState });
        expect(container.getElementsByTagName('h1').length).toBe(0);
        await TestUtils.act(async () => {
            await controller.setTree(h(null, 'Hello, MarkdownViewer!'));
        });
        expect(container.textContent).toBe('Hello, MarkdownViewer!');
    });

    test('it uses the MarkdownLink component for anchor elements', async () => {
        const entry = entries.get('/a.md')!;
        const viewerState = new MarkdownViewerState();
        const Component = () => {
            return composeElements(
                <ServicesProvider value={services} />,
                <MarkdownViewer {...{ entry, fileSystem, viewerState }} />,
            );
        };
        await TestUtils.act(async () => {
            ReactDom.render(<Component />, container);
            await controller.setTree(h(null, h('a', { href: './b.md' }, 'link')));
        });
        expect(Array.from(container.getElementsByClassName(markdownLinkStyles.markdownLink)))
            .toEqual([expect.objectContaining({ textContent: 'link' })]);
    });

    test('it uses the MarkdownBlockquote component for block-quote elements', async () => {
        const entry = entries.get('/a.md')!;
        const viewerState = new MarkdownViewerState();
        const Component = () => {
            return composeElements(
                <ServicesProvider value={services} />,
                <MarkdownViewer {...{ entry, fileSystem, viewerState }} />,
            );
        };
        await TestUtils.act(async () => {
            ReactDom.render(<Component />, container);
            await controller.setTree(h(null, h('blockquote', 'blockquote')));
        });
        expect(Array.from(container.getElementsByClassName(markdownBlockquoteStyles.markdownBlockquote)))
            .toEqual([expect.objectContaining({ textContent: 'blockquote' })]);
    });

    test('it uses the MarkdownCode component for code elements', async () => {
        const entry = entries.get('/a.md')!;
        const viewerState = new MarkdownViewerState();
        const Component = () => {
            return composeElements(
                <ServicesProvider value={services} />,
                <MarkdownViewer {...{ entry, fileSystem, viewerState }} />,
            );
        };
        await TestUtils.act(async () => {
            ReactDom.render(<Component />, container);
            await controller.setTree(h(null, h('code', 'code')));
        });
        expect(Array.from(container.getElementsByClassName(markdownCodeStyles.markdownCode)))
            .toEqual([expect.objectContaining({ textContent: 'code' })]);
    });

    test('it uses the MarkdownImage component for image elements', async () => {
        const entry = entries.get('/a.md')!;
        const viewerState = new MarkdownViewerState();
        const Component = () => {
            return composeElements(
                <ServicesProvider value={services} />,
                <MarkdownViewer {...{ entry, fileSystem, viewerState }} />,
            );
        };
        await TestUtils.act(async () => {
            ReactDom.render(<Component />, container);
            await controller.setTree(h(null, h('img')));
        });
        expect(Array.from(container.getElementsByClassName(markdownImageStyles.markdownImage)))
            .toEqual([expect.any(HTMLElement)]);
    });

    test('it uses the MarkdownParagraph component for paragraph elements', async () => {
        const entry = entries.get('/a.md')!;
        const viewerState = new MarkdownViewerState();
        const Component = () => {
            return composeElements(
                <ServicesProvider value={services} />,
                <MarkdownViewer {...{ entry, fileSystem, viewerState }} />,
            );
        };
        await TestUtils.act(async () => {
            ReactDom.render(<Component />, container);
            await controller.setTree(h(null, h('p', 'paragraph')));
        });
        expect(Array.from(container.getElementsByClassName(markdownParagraphStyles.markdownParagraph)))
            .toEqual([expect.objectContaining({ textContent: 'paragraph' })]);
    });

    describe('className property', () => {
        test('it sets a class name to the component', async () => {
            const entry = entries.get('/a.md')!;
            const viewerState = new MarkdownViewerState();
            const Component = () => {
                return composeElements(
                    <ServicesProvider value={services} />,
                    <MarkdownViewer {...{ entry, fileSystem, viewerState }} className={'test-class'} />,
                );
            };
            await TestUtils.act(async () => {
                ReactDom.render(<Component />, container);
                await immediate();
            });
            const markdownViewer = container.getElementsByClassName(styles.markdownViewer)[0];
            expect(markdownViewer.classList.contains('test-class')).toBe(true);
        });
    });
});
