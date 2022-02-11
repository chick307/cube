import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import { FileEntry } from '../../common/entities/entry';
import { DummyFileSystem } from '../../common/entities/file-system.test-helper';
import { immediate } from '../../common/utils/immediate';
import { EntryPath } from '../../common/values/entry-path';
import type { EntryService } from '../services/entry-service';
import { createEntryService } from '../services/entry-service.test-helper';
import { composeElements } from '../utils/compose-elements';
import { useEntryText } from './use-entry-text';
import { ServicesProvider } from './use-service';

const entry = new FileEntry(new EntryPath('/a/b'));
const fileSystem = new DummyFileSystem();

let container: HTMLElement;

let services: {
    entryService: EntryService;
};

beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    const { entryService } = createEntryService();
    jest.spyOn(entryService, 'readFile').mockReturnValue(Promise.resolve(Buffer.from('abc')));

    services = {
        entryService,
    };
});

afterEach(() => {
    ReactDom.unmountComponentAtNode(container);
    container.remove();
    container = null!;

    services = null!;
});

describe('useEntryText() hook', () => {
    test('it returns text content of entry', async () => {
        let text: string | null | undefined = undefined;
        const Component = () => {
            text = useEntryText({ entry, fileSystem });
            return <></>;
        };
        TestUtils.act(() => {
            ReactDom.render(composeElements(
                <ServicesProvider value={services} />,
                <Component />,
            ), container);
        });
        expect(text).toBeNull();
        await TestUtils.act(() => immediate());
        expect(text).toBe('abc');
    });
});
