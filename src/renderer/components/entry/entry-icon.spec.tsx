import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import { DummyEntry } from '../../../common/entities/entry.test-helper';
import { DummyFileSystem } from '../../../common/entities/file-system.test-helper';
import { immediate } from '../../../common/utils/immediate';
import { EntryPath } from '../../../common/values/entry-path';
import { ServicesProvider } from '../../hooks/use-service';
import { EntryIconService } from '../../services/entry-icon-service';
import { createEntryIconService } from '../../services/entry-icon-service.test-helper';
import type { EntryService } from '../../services/entry-service';
import { createEntryService } from '../../services/entry-service.test-helper';
import { LocalEntryService } from '../../services/local-entry-service';
import { createLocalEntryService } from '../../services/local-entry-service.test-helper';
import { composeElements } from '../../utils/compose-elements';
import { EntryIcon } from './entry-icon';

let container: HTMLElement;

let services: {
    entryIconService: EntryIconService;

    entryService: EntryService;

    localEntryService: LocalEntryService;
};

beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    const { entryIconService } = createEntryIconService();

    const { entryService } = createEntryService();

    const { localEntryService } = createLocalEntryService();
    const homeDirectoryEntry = new DummyEntry(new EntryPath('/home'));
    jest.spyOn(localEntryService, 'getHomeDirectoryEntry').mockReturnValue(homeDirectoryEntry as any);

    services = {
        entryIconService,
        entryService,
        localEntryService,
    };
});

afterEach(() => {
    ReactDom.unmountComponentAtNode(container);
    container.remove();
    container = null!;

    services = null!;
});

describe('EntryIcon component', () => {
    test('it displays a icon of the entry', async () => {
        const entryPath = new EntryPath('/a/b');
        const entry = new DummyEntry(entryPath);
        const fileSystem = new DummyFileSystem();
        const createEntryFromPath = jest.spyOn(services.entryService, 'createEntryFromPath');
        createEntryFromPath.mockReturnValue(Promise.resolve(entry));
        const getEntryIconUrl = jest.spyOn(services.entryIconService, 'getEntryIconUrl');
        getEntryIconUrl.mockReturnValue(Promise.resolve('data:image/png;base64,AAAA'));
        const iconPlaceholder = <></>;
        const Component = () => {
            return composeElements(
                <ServicesProvider value={services} />,
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
        const createEntryFromPath = jest.spyOn(services.entryService, 'createEntryFromPath');
        createEntryFromPath.mockReturnValue(Promise.resolve(entry));
        const getEntryIconUrl = jest.spyOn(services.entryIconService, 'getEntryIconUrl');
        getEntryIconUrl.mockReturnValue(new Promise((r) => {
            resolve = r;
        }));
        const iconPlaceholder = <div className={'placeholder'}>PLACEHOLDER</div>;
        const Component = () => {
            return composeElements(
                <ServicesProvider value={services} />,
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
                <ServicesProvider value={services} />,
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
