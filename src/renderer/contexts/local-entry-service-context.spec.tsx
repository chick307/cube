import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import type { LocalEntryService } from '../services/local-entry-service';
import { createLocalEntryService } from '../services/local-entry-service.test-helper';
import { LocalEntryServiceProvider, useLocalEntryService } from './local-entry-service-context';

const localEntryService = createLocalEntryService();

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

describe('LocalEntryService context', () => {
    describe('LocalEntryServiceProvider component', () => {
        test('it provides a LocalEntryService instance', () => {
            let instance: LocalEntryService | null = null;
            const Component = () => {
                instance = useLocalEntryService();
                return <></>;
            };
            TestUtils.act(() => {
                ReactDom.render((
                    <LocalEntryServiceProvider value={localEntryService}>
                        <Component />
                    </LocalEntryServiceProvider>
                ), container);
            });
            expect(instance).toBe(localEntryService);
        });
    });

    describe('useLocalEntryService hook', () => {
        test('it throws an error if LocalEntryService instance is not provided', () => {
            const handleError = jest.fn();
            const Component = () => {
                try {
                    useLocalEntryService();
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

