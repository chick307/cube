import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import { DummyEntry } from '../../../common/entities/entry.test-helper';
import { DummyFileSystem } from '../../../common/entities/file-system.test-helper';
import { immediate } from '../../../common/utils/immediate';
import { EntryPath } from '../../../common/values/entry-path';
import { EntryIconServiceProvider } from '../../contexts/entry-icon-service-context';
import { EntryServiceProvider } from '../../contexts/entry-service-context';
import { LocalEntryServiceProvider } from '../../contexts/local-entry-service-context';
import { createEntryIconService } from '../../services/entry-icon-service.test-helper';
import type { EntryService } from '../../services/entry-service';
import { createEntryService } from '../../services/entry-service.test-helper';
import { LocalEntryService } from '../../services/local-entry-service';
import { createLocalEntryService } from '../../services/local-entry-service.test-helper';
import { composeElements } from '../../utils/compose-elements';
import { EntryIcon } from './entry-icon';

const { entryIconService } = createEntryIconService();

let container: HTMLElement;

let entryService: EntryService;

let localEntryService: LocalEntryService;

beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    ({ entryService } = createEntryService());
    ({ localEntryService } = createLocalEntryService());

    const homeDirectoryEntry = new DummyEntry(new EntryPath('/home'));
    jest.spyOn(localEntryService, 'getHomeDirectoryEntry').mockReturnValue(homeDirectoryEntry as any);
});

afterEach(() => {
    ReactDom.unmountComponentAtNode(container);
    container.remove();
    container = null!;

    entryService = null!;
    localEntryService = null!;
});

describe('EntryIcon component', () => {
    test('it displays a icon of the entry', async () => {
        const entryPath = new EntryPath('/a/b');
        const entry = new DummyEntry(entryPath);
        const fileSystem = new DummyFileSystem();
        const createEntryFromPath = jest.spyOn(entryService, 'createEntryFromPath');
        createEntryFromPath.mockReturnValue(Promise.resolve(entry));
        const getEntryIconUrl = jest.spyOn(entryIconService, 'getEntryIconUrl');
        getEntryIconUrl.mockReturnValue(Promise.resolve('data:image/png;base64,AAAA'));
        const iconPlaceholder = <></>;
        const Component = () => {
            return composeElements(
                <EntryServiceProvider value={entryService} />,
                <LocalEntryServiceProvider value={localEntryService} />,
                <EntryIconServiceProvider value={entryIconService} />,
                <EntryIcon className={'icon'} {...{ entryPath, fileSystem, iconPlaceholder }} />,
            );
        };
        await TestUtils.act(async () => {
            ReactDom.render(<Component />, container);
            await immediate();
        });
        expect(createEntryFromPath).toHaveBeenCalledTimes(1);
        expect(createEntryFromPath.mock.calls[0][0].entryPath).toEqual(entryPath);
        expect(createEntryFromPath.mock.calls[0][0].fileSystem).toEqual(fileSystem);
        expect(getEntryIconUrl).toHaveBeenCalledTimes(1);
        expect(getEntryIconUrl.mock.calls[0][0]).toBe(entry);
        expect(container.querySelector('.icon > img')?.getAttribute('src')).toBe('data:image/png;base64,AAAA');
    });

    test('it displays the passed placeholder while the icon URL is not resolved', async () => {
        const entryPath = new EntryPath('/a/b');
        const entry = new DummyEntry(entryPath);
        const fileSystem = new DummyFileSystem();
        let resolve: (url: string) => void = () => {};
        const createEntryFromPath = jest.spyOn(entryService, 'createEntryFromPath');
        createEntryFromPath.mockReturnValue(Promise.resolve(entry));
        const getEntryIconUrl = jest.spyOn(entryIconService, 'getEntryIconUrl');
        getEntryIconUrl.mockReturnValue(new Promise((r) => {
            resolve = r;
        }));
        const iconPlaceholder = <div className={'placeholder'}>PLACEHOLDER</div>;
        const Component = () => {
            return composeElements(
                <EntryServiceProvider value={entryService} />,
                <LocalEntryServiceProvider value={localEntryService} />,
                <EntryIconServiceProvider value={entryIconService} />,
                <EntryIcon className={'icon'} {...{ entryPath, fileSystem, iconPlaceholder }} />,
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
        expect(container.querySelector('.icon > img')?.getAttribute('src')).toBe('data:image/png;base64,BBBB');
        expect(container.querySelector('.placeholder')).toBeNull();
    });

    test('it displays the image of the passed URL', async () => {
        const entryPath = new EntryPath('/a/b');
        const fileSystem = new DummyFileSystem();
        const iconPlaceholder = <></>;
        const src = 'data:image/png;base64,CCCC';
        const Component = () => {
            return composeElements(
                <EntryServiceProvider value={entryService} />,
                <LocalEntryServiceProvider value={localEntryService} />,
                <EntryIconServiceProvider value={entryIconService} />,
                <EntryIcon className={'icon'} {...{ entryPath, fileSystem, iconPlaceholder, src }} />,
            );
        };
        await TestUtils.act(async () => {
            ReactDom.render(<Component />, container);
            await immediate();
        });
        expect(container.querySelector('.icon > img')?.getAttribute('src')).toBe('data:image/png;base64,CCCC');
    });
});
