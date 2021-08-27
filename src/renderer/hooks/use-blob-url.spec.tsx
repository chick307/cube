import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import { FileEntry } from '../../common/entities/entry';
import { FileSystem } from '../../common/entities/file-system';
import { immediate } from '../../common/utils/immediate';
import { EntryPath } from '../../common/values/entry-path';
import { EntryServiceProvider } from '../contexts/entry-service-context';
import type { EntryService } from '../services/entry-service';
import { useBlobUrl } from './use-blob-url';

const notImplemented = () => {
    throw Error('Not implemented');
};

class UnknownFileSystem extends FileSystem {
    //
}

const entry = new FileEntry(new EntryPath('/a/b'));
const fileSystem = new UnknownFileSystem();

const dummyEntryService: EntryService = {
    createEntryFromPath: async () => null,
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

describe('useBlobUrl() hook', () => {
    test('it returns blob URL', async () => {
        const createObjectURL = jest.spyOn(URL, 'createObjectURL');
        createObjectURL.mockReturnValue('blob:abc');
        const revokeObjectURL = jest.spyOn(URL, 'revokeObjectURL');
        revokeObjectURL.mockReturnValue();
        let url: string | null = null;
        const Component = (props: { type?: string | null; }) => {
            const { type } = props;
            url = useBlobUrl({ entry, fileSystem, type });
            return <></>;
        };
        await TestUtils.act(async () => {
            ReactDom.render((
                <EntryServiceProvider value={dummyEntryService}>
                    <Component />
                </EntryServiceProvider>
            ), container);
            await immediate();
        });
        expect(createObjectURL).toHaveBeenCalledTimes(1);
        expect(createObjectURL)
            .toHaveBeenCalledWith(new Blob([Buffer.from('abc')], { type: 'application/octet-stream' }));
        createObjectURL.mockClear();
        createObjectURL.mockReturnValue('blob:def');
        expect(revokeObjectURL).not.toHaveBeenCalled();
        expect(url).toBe('blob:abc');
        await TestUtils.act(async () => {
            ReactDom.render((
                <EntryServiceProvider value={dummyEntryService}>
                    <Component type={'text/plain'} />
                </EntryServiceProvider>
            ), container);
            await immediate();
        });
        expect(createObjectURL).toHaveBeenCalledTimes(1);
        expect(createObjectURL)
            .toHaveBeenCalledWith(new Blob([Buffer.from('abc')], { type: 'text/plain' }));
        createObjectURL.mockClear();
        expect(revokeObjectURL).toHaveBeenCalledTimes(1);
        expect(revokeObjectURL).toHaveBeenCalledWith('blob:abc');
        revokeObjectURL.mockClear();
        expect(url).toBe('blob:def');
        await TestUtils.act(async () => {
            ReactDom.unmountComponentAtNode(container);
            await immediate();
        });
        expect(createObjectURL).not.toHaveBeenCalled();
        expect(revokeObjectURL).toHaveBeenCalledTimes(1);
        expect(revokeObjectURL).toHaveBeenCalledWith('blob:def');
    });
});
