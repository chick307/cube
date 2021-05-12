import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import { EntryService } from '../services/entry-service';
import { EntryServiceProvider, useEntryService } from './entry-service-context';

const rejectedPromise = Promise.reject(Error());
rejectedPromise.catch(() => {});

const dummyEntryService: EntryService = {
    readDirectory: jest.fn().mockReturnValue(rejectedPromise),
    readFile: jest.fn().mockReturnValue(rejectedPromise),
    readLink: jest.fn().mockReturnValue(rejectedPromise),
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
                    <EntryServiceProvider value={dummyEntryService}>
                        <Component />
                    </EntryServiceProvider>
                ), container);
            });
            expect(instance).toBe(dummyEntryService);
        });
    });

    describe('useEntryService hook', () => {
        test('it throws an error if EntryService instance is not provided', () => {
            const handleError = jest.fn();
            const Component = () => {
                try {
                    useEntryService();
                } catch(e) {
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
