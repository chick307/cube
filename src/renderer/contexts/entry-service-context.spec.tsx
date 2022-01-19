import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import type { EntryService } from '../services/entry-service';
import { createEntryService } from '../services/entry-service.test-helper';
import { EntryServiceProvider, useEntryService } from './entry-service-context';

let container: HTMLElement;

let entryService: EntryService;

beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    ({ entryService } = createEntryService());
});

afterEach(() => {
    ReactDom.unmountComponentAtNode(container);
    container.remove();
    container = null!;

    entryService = null!;
});

describe('EntryService context', () => {
    describe('EntryServiceProvider component', () => {
        test('it provides a EntryService instance', () => {
            let instance: EntryService | null = null;
            const Component = () => {
                instance = useEntryService();
                return <></>;
            };
            TestUtils.act(() => {
                ReactDom.render((
                    <EntryServiceProvider value={entryService}>
                        <Component />
                    </EntryServiceProvider>
                ), container);
            });
            expect(instance).toBe(entryService);
        });
    });

    describe('useEntryService hook', () => {
        test('it throws an error if EntryService instance is not provided', () => {
            const handleError = jest.fn();
            const Component = () => {
                try {
                    useEntryService();
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
