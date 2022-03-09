import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import { ServicesProvider } from '../../../hooks/use-service';
import { composeElements } from '../../../utils/compose-elements';
import type { MarkdownViewerController } from '../../../viewer-controllers/markdown-viewer-controller';
import { createMarkdownViewerController } from '../../../viewer-controllers/markdown-viewer-controller.test-helper';
import { MarkdownLink } from './markdown-link';
import styles from './markdown-link.module.css';

let services: {
    markdownViewerController: MarkdownViewerController;
};

let container: HTMLElement;

beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    const { markdownViewerController } = createMarkdownViewerController();

    services = {
        markdownViewerController,
    };
});

afterEach(() => {
    ReactDom.unmountComponentAtNode(container);
    container.remove();
    container = null!;

    services = null!;
});

describe('MarkdownLink component', () => {
    test('it renders an anchor element', () => {
        const Component = () => {
            return composeElements(
                <ServicesProvider value={services} />,
                <MarkdownLink href='./b.md'>
                    link
                </MarkdownLink>,
            );
        };
        TestUtils.act(() => {
            ReactDom.render(<Component />, container);
        });
        const markdownLinks = Array.from(container.getElementsByClassName(styles.markdownLink));
        expect(markdownLinks).toEqual([expect.objectContaining({ tagName: 'A', textContent: 'link' })]);
    });

    test('it opens the link when clicked', () => {
        const openLink = jest.spyOn(services.markdownViewerController, 'openLink');
        const Component = () => {
            return composeElements(
                <ServicesProvider value={services} />,
                <MarkdownLink href='./b.md'>
                    link
                </MarkdownLink>,
            );
        };
        TestUtils.act(() => {
            ReactDom.render(<Component />, container);
        });
        expect(openLink).not.toHaveBeenCalled();
        const markdownLink = container.getElementsByClassName(styles.markdownLink)[0];
        TestUtils.Simulate.click(markdownLink);
        expect(openLink).toHaveBeenCalledTimes(1);
        expect(openLink).toHaveBeenCalledWith({ href: './b.md', inNewTab: false });
    });

    test('it opens the link in a new tab when clicked by auxiliary mouse button', () => {
        const openLink = jest.spyOn(services.markdownViewerController, 'openLink');
        const Component = () => {
            return composeElements(
                <ServicesProvider value={services} />,
                <MarkdownLink href='https://example.com'>
                    link
                </MarkdownLink>,
            );
        };
        TestUtils.act(() => {
            ReactDom.render(<Component />, container);
        });
        expect(openLink).not.toHaveBeenCalled();
        const markdownLink = container.getElementsByClassName(styles.markdownLink)[0];
        TestUtils.Simulate.click(markdownLink, { type: 'auxclick' });
        expect(openLink).toHaveBeenCalledTimes(1);
        expect(openLink).toHaveBeenCalledWith({ href: 'https://example.com', inNewTab: true });
    });

    test('it does nothing when clicked if the link does not have a URL', () => {
        const openLink = jest.spyOn(services.markdownViewerController, 'openLink');
        const Component = () => {
            return composeElements(
                <ServicesProvider value={services} />,
                <MarkdownLink>
                    link
                </MarkdownLink>,
            );
        };
        TestUtils.act(() => {
            ReactDom.render(<Component />, container);
        });
        expect(openLink).not.toHaveBeenCalled();
        const markdownLink = container.getElementsByClassName(styles.markdownLink)[0];
        TestUtils.Simulate.click(markdownLink);
        expect(openLink).not.toHaveBeenCalled();
    });

    describe('className property', () => {
        test('it sets a class name to the component', () => {
            const Component = () => {
                return composeElements(
                    <ServicesProvider value={services} />,
                    <MarkdownLink className={'test-class'}>
                        link
                    </MarkdownLink>,
                );
            };
            TestUtils.act(() => {
                ReactDom.render(<Component />, container);
            });
            expect(container.getElementsByClassName(styles.markdownLink).length).toBe(1);
            const markdownLink = container.getElementsByClassName(styles.markdownLink)[0];
            expect(markdownLink.classList.contains('test-class')).toBe(true);
        });
    });
});
