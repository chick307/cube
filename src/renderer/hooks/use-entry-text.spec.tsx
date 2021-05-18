import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import { FileEntry } from '../../common/entities/file-entry';
import { FileSystem } from '../../common/entities/file-system';
import { immediate } from '../../common/utils/immediate';
import { EntryPath } from '../../common/values/entry-path';
import { EntryServiceProvider } from '../contexts/entry-service-context';
import type { EntryService } from '../services/entry-service';
import { useEntryText } from './use-entry-text';

const notImplemented = () => {
    throw Error('Not implemented');
};

class UnknownFileSystem extends FileSystem {
    //
}

const entry = new FileEntry(new EntryPath('/a/b'));
const fileSystem = new UnknownFileSystem();

const dummyEntryService: EntryService = {
    readDirectory: async () => notImplemented(),
    readFile: async () => Buffer.from('abc'),
    readLink: async () => notImplemented(),
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

describe('useEntryText() hook', () => {
    test('it returns text content of entry', async () => {
        let text: string | null | undefined = undefined;
        const Component = () => {
            text = useEntryText({ entry, fileSystem });
            return <></>;
        };
        TestUtils.act(() => {
            ReactDom.render((
                <EntryServiceProvider value={dummyEntryService}>
                    <Component />
                </EntryServiceProvider>
            ), container);
        });
        expect(text).toBeNull();
        await TestUtils.act(() => immediate());
        expect(text).toBe('abc');
    });
});
