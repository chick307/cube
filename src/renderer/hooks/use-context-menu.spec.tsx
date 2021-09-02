import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import { ContextMenuServiceProvider } from '../contexts/context-menu-service-context';
import { useContextMenu } from './use-context-menu';

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

describe('useContextMenu() hook', () => {
    test('it returns a component', () => {
        const popupContextMenu = jest.fn();
        const contextMenuService = { popupContextMenu };
        const Component = () => {
            const ContextMenu = useContextMenu(() => [
                { label: 'A' },
            ], []);
            return (
                <ContextMenuServiceProvider value={contextMenuService}>
                    <ContextMenu>
                        <div id="content" />
                    </ContextMenu>
                </ContextMenuServiceProvider>
            );
        };
        TestUtils.act(() => {
            ReactDom.render(<Component />, container);
        });
        const content = container.querySelector('#content') as HTMLDivElement;
        expect(content).toBeInstanceOf(HTMLDivElement);
        expect(popupContextMenu).not.toHaveBeenCalled();
        {
            const event = new (MouseEvent as any)('contextmenu', {
                bubbles: true,
                cancelable: true,
                clientX: 123,
                clientY: 456,
            });
            content.dispatchEvent(event);
            expect(popupContextMenu).toHaveBeenCalledTimes(1);
            expect(popupContextMenu).toHaveBeenCalledWith({
                template: [{ label: 'A' }],
                x: 123,
                y: 456,
            });
        }
    });
});
