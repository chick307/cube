import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import type { ContextMenuService } from '../services/context-menu-service';
import { ContextMenuServiceProvider, useContextMenuService } from './context-menu-service-context';

const contextMenuService: ContextMenuService = {
    popupContextMenu: () => {},
};

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

describe('ContextMenuService context', () => {
    describe('ContextMenuServiceProvider component', () => {
        test('it provides a ContextMenuService instance', () => {
            let instance: ContextMenuService | null = null;
            const Component = () => {
                instance = useContextMenuService();
                return <></>;
            };
            TestUtils.act(() => {
                ReactDom.render((
                    <ContextMenuServiceProvider value={contextMenuService}>
                        <Component />
                    </ContextMenuServiceProvider>
                ), container);
            });
            expect(instance).toBe(contextMenuService);
        });
    });

    describe('useContextMenuService hook', () => {
        test('it throws an error if ContextMenuService instance is not provided', () => {
            const handleError = jest.fn();
            const Component = () => {
                try {
                    useContextMenuService();
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
