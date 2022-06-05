import { act, cleanup, fireEvent, render } from '@testing-library/react';

import { createTabController } from '../../controllers/tab-controller.test-helper';
import { composeElements } from '../../utils/compose-elements';
import { TabCloseButton } from './tab-close-button';
import styles from './tab-close-button.module.css';
import { ServicesProvider } from '../../hooks/use-service';

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

afterEach(() => {
    jest.resetAllMocks();
});

describe('TabCloseButton component', () => {
    test('it renders an element with the passed class name', async () => {
        const { tabController } = createTabController();
        const services = { tabController };
        const Component = () => {
            return composeElements(
                <ServicesProvider value={services} />,
                <TabCloseButton className={'class-name'} tabId={123} />,
            );
        };
        act(() => {
            render(<Component />, { container });
        });
        const tabCloseButton = container.getElementsByClassName(styles.tabCloseButton)[0];
        expect(tabCloseButton.classList.contains('class-name')).toBe(true);
    });

    test('it calls tabContoller.removeTab() method when clicked', async () => {
        const { tabController } = createTabController();
        const removeTab = jest.spyOn(tabController, 'removeTab');
        const services = { tabController };
        const Component = () => {
            return composeElements(
                <ServicesProvider value={services} />,
                <TabCloseButton tabId={123} />,
            );
        };
        act(() => {
            render(<Component />, { container });
        });
        const tabCloseButton = container.getElementsByClassName(styles.tabCloseButton)[0];
        fireEvent.click(tabCloseButton);
        expect(removeTab).toHaveBeenCalledTimes(1);
        expect(removeTab).toHaveBeenCalledWith({ id: 123 });
    });
});
