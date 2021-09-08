import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import { ViewerService } from '../services/viewer-service';
import { createViewerService } from '../services/viewer-service.test-helper';
import { composeElements } from '../utils/compose-elements';
import { ViewerServiceProvider, useViewerService } from './viewer-service-context';

let container: HTMLElement;

beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
});

afterEach(() => {
    ReactDom.unmountComponentAtNode(container);
    container.remove();
    container = null!;
});

describe('ViewerService context', () => {
    describe('ViewerServiceProvider component', () => {
        test('it provides a ViewerService instance', () => {
            let instance: ViewerService | null = null;

            const Component = () => {
                const viewerService = useViewerService();
                instance = viewerService;
                return <></>;
            };

            const { viewerService } = createViewerService();

            TestUtils.act(() => {
                ReactDom.render(composeElements(
                    <ViewerServiceProvider value={viewerService}/>,
                    <Component />,
                ), container);
            });

            expect(instance).toBe(viewerService);
        });
    });

    describe('useViewerService hook', () => {
        test('it throws an error if ViewerService instance is not provided', () => {
            const handleError = jest.fn();
            const Component = () => {
                try {
                    useViewerService();
                } catch (e) {
                    handleError(e);
                }
                return <></>;
            };

            TestUtils.act(() => {
                ReactDom.render((
                    <Component />
                ), container);
            });

            expect(handleError).toHaveBeenCalledTimes(1);
        });
    });
});
