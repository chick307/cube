import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import { FileEntry } from '../../common/entities/file-entry';
import { immediate } from '../../common/utils/immediate';
import { EntryPath } from '../../common/values/entry-path';
import { EntryIconServiceProvider } from '../contexts/entry-icon-service-context';
import { EntryIcon } from './entry-icon';

const rejectedPromise = Promise.reject(Error());
rejectedPromise.catch(() => {});

const dummyEntryIconService = {
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

describe('EntryIcon component', () => {
    test('it displays a icon of the entry', async () => {
        const { getEntryIconUrl } = dummyEntryIconService;
        getEntryIconUrl.mockReturnValue('data:image/png;base64,AAAA');
        const entry = new FileEntry(new EntryPath('/a/b'));
        const iconPlaceholder = <></>;
        const Component = () => {
            return (
                <EntryIconServiceProvider value={dummyEntryIconService}>
                    <EntryIcon className={'icon'} {...{ entry, iconPlaceholder }} />
                </EntryIconServiceProvider>
            );
        };
        await TestUtils.act(async () => {
            ReactDom.render(<Component />, container);
            await immediate();
        });
        expect(container.querySelector('.icon')?.getAttribute('src')).toBe('data:image/png;base64,AAAA');
    });

    test('it displays the passed placeholder while the icon URL is not resolved', async () => {
        let resolve: (url: string) => void = () => {};
        const { getEntryIconUrl } = dummyEntryIconService;
        getEntryIconUrl.mockReturnValue(new Promise((r) => {
            resolve = r;
        }));
        const entry = new FileEntry(new EntryPath('/a/b'));
        const iconPlaceholder = <div className={'placeholder'}>PLACEHOLDER</div>;
        const Component = () => {
            return (
                <EntryIconServiceProvider value={dummyEntryIconService}>
                    <EntryIcon className={'icon'} {...{ entry, iconPlaceholder }} />
                </EntryIconServiceProvider>
            );
        };
        await TestUtils.act(async () => {
            ReactDom.render(<Component />, container);
            await immediate();
        });
        expect(container.querySelector('.icon')).toBeNull();
        expect(container.querySelector('.placeholder')?.textContent).toBe('PLACEHOLDER');
        await TestUtils.act(async () => {
            resolve('data:image/png;base64,BBBB');
            await immediate();
        });
        expect(container.querySelector('.icon')?.getAttribute('src')).toBe('data:image/png;base64,BBBB');
        expect(container.querySelector('.placeholder')).toBeNull();
    });

    test('it displays the image of the passed URL', async () => {
        const entry = new FileEntry(new EntryPath('/a/b'));
        const iconPlaceholder = <></>;
        const src = 'data:image/png;base64,CCCC';
        const Component = () => {
            return (
                <EntryIconServiceProvider value={dummyEntryIconService}>
                    <EntryIcon className={'icon'} {...{ entry, iconPlaceholder, src }} />
                </EntryIconServiceProvider>
            );
        };
        await TestUtils.act(async () => {
            ReactDom.render(<Component />, container);
            await immediate();
        });
        expect(container.querySelector('.icon')?.getAttribute('src')).toBe('data:image/png;base64,CCCC');
    });
});
