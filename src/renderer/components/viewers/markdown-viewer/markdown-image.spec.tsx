import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import { immediate } from '../../../../common/utils/immediate';
import { ServicesProvider } from '../../../hooks/use-service';
import type {
    MarkdownViewerController,
} from '../../../viewer-controllers/markdown-viewer-controller';
import { createMarkdownViewerController } from '../../../viewer-controllers/markdown-viewer-controller.test-helper';
import { MarkdownImage } from './markdown-image';
import styles from './markdown-image.module.css';

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

describe('MarkdownImage component', () => {
    test('it renders an image element', async () => {
        const imageBlob = new Blob(['<svg />']);
        const loadImage = jest.spyOn(services.markdownViewerController, 'loadImage');
        loadImage.mockReturnValue(Promise.resolve(imageBlob));
        const Component = () => {
            return (
                <div>
                    <ServicesProvider value={services}>
                        <MarkdownImage src={'./a.svg'} />
                    </ServicesProvider>
                </div>
            );
        };
        await TestUtils.act(async () => {
            ReactDom.render(<Component />, container);
            await immediate();
        });
        const markdownImages = Array.from(container.getElementsByClassName(styles.markdownImage));
        expect(markdownImages).toEqual([expect.objectContaining({ tagName: 'SPAN' })]);
        expect(Array.from(markdownImages[0].getElementsByTagName('img')))
            .toEqual([expect.objectContaining({ tagName: 'IMG' })]);
        expect(loadImage).toHaveBeenCalledTimes(1);
        expect(loadImage).toHaveBeenCalledWith({ src: './a.svg' });
    });

    test('it renders alternative text if not able to load the image', async () => {
        const loadImage = jest.spyOn(services.markdownViewerController, 'loadImage');
        loadImage.mockReturnValue(Promise.resolve(null));
        const Component = () => {
            return (
                <div>
                    <ServicesProvider value={services}>
                        <MarkdownImage src={'./a.svg'} alt={'alternative text'} />
                    </ServicesProvider>
                </div>
            );
        };
        await TestUtils.act(async () => {
            ReactDom.render(<Component />, container);
            await immediate();
        });
        const markdownImages = Array.from(container.getElementsByClassName(styles.markdownImage));
        expect(markdownImages).toEqual([expect.objectContaining({ tagName: 'SPAN' })]);
        expect(Array.from(markdownImages[0].getElementsByTagName('img'))).toEqual([]);
        expect(markdownImages[0]).toMatchObject({ textContent: 'alternative text' });
    });

    test('it renders alternative text if failed to load the image', async () => {
        const loadImage = jest.spyOn(services.markdownViewerController, 'loadImage');
        const loadImagePromise = Promise.reject(Error('failed to load'));
        loadImagePromise.catch(() => {}); // to avoid unhandled rejection
        loadImage.mockReturnValue(loadImagePromise);
        const Component = () => {
            return (
                <div>
                    <ServicesProvider value={services}>
                        <MarkdownImage src={'./a.svg'} alt={'alternative text'} />
                    </ServicesProvider>
                </div>
            );
        };
        await TestUtils.act(async () => {
            ReactDom.render(<Component />, container);
            await immediate();
        });
        const markdownImages = Array.from(container.getElementsByClassName(styles.markdownImage));
        expect(markdownImages).toEqual([expect.objectContaining({ tagName: 'SPAN' })]);
        expect(Array.from(markdownImages[0].getElementsByTagName('img'))).toEqual([]);
        expect(markdownImages[0]).toMatchObject({ textContent: 'alternative text' });
    });

    test('it renders alternative text if the image URL does not exist', async () => {
        const loadImage = jest.spyOn(services.markdownViewerController, 'loadImage');
        const Component = () => {
            return (
                <div>
                    <ServicesProvider value={services}>
                        <MarkdownImage alt={'alternative text'} />
                    </ServicesProvider>
                </div>
            );
        };
        await TestUtils.act(async () => {
            ReactDom.render(<Component />, container);
            await immediate();
        });
        const markdownImages = Array.from(container.getElementsByClassName(styles.markdownImage));
        expect(markdownImages).toEqual([expect.objectContaining({ tagName: 'SPAN' })]);
        expect(Array.from(markdownImages[0].getElementsByTagName('img'))).toEqual([]);
        expect(markdownImages[0]).toMatchObject({ textContent: 'alternative text' });
        expect(loadImage).not.toHaveBeenCalled();
    });

    test('it renders the image URL if failed on loading and alternative text does not exist', async () => {
        const loadImage = jest.spyOn(services.markdownViewerController, 'loadImage');
        loadImage.mockReturnValue(Promise.resolve(null));
        const Component = () => {
            return (
                <div>
                    <ServicesProvider value={services}>
                        <MarkdownImage src={'./a.svg'} />
                    </ServicesProvider>
                </div>
            );
        };
        await TestUtils.act(async () => {
            ReactDom.render(<Component />, container);
            await immediate();
        });
        const markdownImage = container.getElementsByClassName(styles.markdownImage)[0];
        expect(markdownImage).toMatchObject({ tagName: 'SPAN', textContent: './a.svg' });
        expect(markdownImage.getElementsByTagName('img').length).toEqual(0);
    });

    test('it renders nothing if the image URL does not exist', async () => {
        const loadImage = jest.spyOn(services.markdownViewerController, 'loadImage');
        const Component = () => {
            return (
                <div>
                    <ServicesProvider value={services}>
                        <MarkdownImage />
                    </ServicesProvider>
                </div>
            );
        };
        await TestUtils.act(async () => {
            ReactDom.render(<Component />, container);
            await immediate();
        });
        const markdownImage = container.getElementsByClassName(styles.markdownImage)[0];
        expect(markdownImage).toMatchObject({ tagName: 'SPAN', textContent: '' });
        expect(markdownImage.getElementsByTagName('img').length).toEqual(0);
        expect(loadImage).not.toHaveBeenCalled();
    });

    describe('className property', () => {
        test('it sets a class name to the component', async () => {
            const Component = () => {
                return (
                    <div>
                        <ServicesProvider value={services}>
                            <MarkdownImage className={'test-class'} />
                        </ServicesProvider>
                    </div>
                );
            };
            await TestUtils.act(async () => {
                ReactDom.render(<Component />, container);
                await immediate();
            });
            expect(container.getElementsByClassName(styles.markdownImage).length).toBe(1);
            const markdownImage = container.getElementsByClassName(styles.markdownImage)[0];
            expect(markdownImage.classList.contains('test-class')).toBe(true);
        });
    });
});
