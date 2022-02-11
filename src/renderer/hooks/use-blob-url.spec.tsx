import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import { FileEntry } from '../../common/entities/entry';
import { DummyFileSystem } from '../../common/entities/file-system.test-helper';
import { immediate } from '../../common/utils/immediate';
import { EntryPath } from '../../common/values/entry-path';
import type { EntryService } from '../services/entry-service';
import { createEntryService } from '../services/entry-service.test-helper';
import { composeElements } from '../utils/compose-elements';
import { useBlobUrl } from './use-blob-url';
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
            ReactDom.render(composeElements(
                <ServicesProvider value={services} />,
                <Component />,
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
            ReactDom.render(composeElements(
                <ServicesProvider value={services} />,
                <Component type={'text/plain'} />,
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
