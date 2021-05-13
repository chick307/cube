import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import { EntryIconService } from '../services/entry-icon-service';
import { EntryIconServiceProvider, useEntryIconService } from './entry-icon-service-context';

const rejectedPromise = Promise.reject(Error());
rejectedPromise.catch(() => {});

const dummyEntryIconService: EntryIconService = {
    getDirectoryEntryIconUrl: jest.fn().mockReturnValue(rejectedPromise),
    getEntryIconUrl: jest.fn().mockReturnValue(rejectedPromise),
    getFileEntryIconUrl: jest.fn().mockReturnValue(rejectedPromise),
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

describe('EntryIconService context', () => {
    describe('EntryIconServiceProvider component', () => {
        test('it provides a EntryIconService instance', () => {
            let instance: EntryIconService | null = null;
            const Component = () => {
                instance = useEntryIconService();
                return <></>;
            };
            TestUtils.act(() => {
                ReactDom.render((
                    <EntryIconServiceProvider value={dummyEntryIconService}>
                        <Component />
                    </EntryIconServiceProvider>
                ), container);
            });
            expect(instance).toBe(dummyEntryIconService);
        });
    });

    describe('useEntryIconService hook', () => {
        test('it throws an error if EntryIconService instance is not provided', () => {
            const handleError = jest.fn();
            const Component = () => {
                try {
                    useEntryIconService();
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
