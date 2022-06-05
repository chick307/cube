import { act, cleanup, render } from '@testing-library/react';

import { composeElements } from '../utils/compose-elements';
import { useContextMenu } from './use-context-menu';
import { ServicesProvider } from './use-service';

let container: HTMLElement;

beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
});

afterEach(() => {
    cleanup();
    container.remove();
    container = null!;
});

describe('useContextMenu() hook', () => {
    test('it returns a component', () => {
        const popupContextMenu = jest.fn();
        const contextMenuService = { popupContextMenu };
        const services = { contextMenuService };
        const Component = () => {
            const ContextMenu = useContextMenu(() => [
                { label: 'A' },
            ], []);
            return composeElements(
                <ServicesProvider value={services} />,
                <ContextMenu />,
                <div id="content" />,
            );
        };
        act(() => {
            render(<Component />, { container });
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
