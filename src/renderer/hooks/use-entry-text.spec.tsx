import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import { FileEntry } from '../../common/entities/entry';
import { FileSystem } from '../../common/entities/file-system';
import { immediate } from '../../common/utils/immediate';
import { EntryPath } from '../../common/values/entry-path';
import { EntryServiceProvider } from '../contexts/entry-service-context';
import type { EntryService } from '../services/entry-service';
import { createEntryService } from '../services/entry-service.test-helper';
import { useEntryText } from './use-entry-text';

class UnknownFileSystem extends FileSystem {
    //
}

const entry = new FileEntry(new EntryPath('/a/b'));
const fileSystem = new UnknownFileSystem();

let container: HTMLElement;

let entryService: EntryService;

beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    ({ entryService } = createEntryService());
    jest.spyOn(entryService, 'readFile').mockReturnValue(Promise.resolve(Buffer.from('abc')));
});

afterEach(() => {
    ReactDom.unmountComponentAtNode(container);
    container.remove();
    container = null!;

    entryService = null!;
});

describe('useEntryText() hook', () => {
    test('it returns text content of entry', async () => {
        let text: string | null | undefined = undefined;
        const Component = () => {
            text = useEntryText({ entry, fileSystem });
            return <></>;
        };
        TestUtils.act(() => {
            ReactDom.render((
                <EntryServiceProvider value={entryService}>
                    <Component />
                </EntryServiceProvider>
            ), container);
        });
        expect(text).toBeNull();
        await TestUtils.act(() => immediate());
        expect(text).toBe('abc');
    });
});
