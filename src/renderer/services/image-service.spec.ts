import { DummyEntry } from '../../common/entities/entry.test-helper';
import { DummyFileSystem } from '../../common/entities/file-system.test-helper';
import { CloseController, CloseSignal } from '../../common/utils/close-controller';
import { immediate } from '../../common/utils/immediate';
import { EntryPath } from '../../common/values/entry-path';
import type { EntryService } from './entry-service';
import { createEntryService } from './entry-service.test-helper';
import { ImageServiceImpl } from './image-service';

const fileSystem = new DummyFileSystem();

let services: {
    entryService: EntryService;
};

beforeEach(() => {
    const { entryService } = createEntryService();

    services = {
        entryService,
    };
});

afterEach(() => {
    services = null!;
});

describe('ImageServiceImpl class', () => {
    describe('imageService.loadBlob() method', () => {
        test('it loads the entry', async () => {
            const entryPath = new EntryPath('/a.jpeg');
            const createEntryFromPath = jest.spyOn(services.entryService, 'createEntryFromPath');
            createEntryFromPath.mockImplementation(async () => new DummyEntry(entryPath));
            const readFile = jest.spyOn(services.entryService, 'readFile');
            readFile.mockImplementation(async () => Buffer.from([1, 2, 3]));
            const imageService = new ImageServiceImpl({ ...services });
            const promise = imageService.loadBlob({ entryPath, fileSystem });
            await expect(promise).resolves.toBeInstanceOf(Blob);
            expect(Buffer.from(await (await promise)!.arrayBuffer())).toEqual(Buffer.from([1, 2, 3]));
        });

        test('it throws an error if the passed entry path does not exist', async () => {
            const entryPath = new EntryPath('/a.jpeg');
            const createEntryFromPath = jest.spyOn(services.entryService, 'createEntryFromPath');
            createEntryFromPath.mockImplementation(async () => null);
            const imageService = new ImageServiceImpl({ ...services });
            const promise = imageService.loadBlob({ entryPath, fileSystem });
            await expect(promise).rejects.toThrow();
        });

        test('it returns a blob with the appropriate media types', async () => {
            const createEntryFromPath = jest.spyOn(services.entryService, 'createEntryFromPath');
            createEntryFromPath.mockImplementation(async ({ entryPath }) => new DummyEntry(entryPath));
            const readFile = jest.spyOn(services.entryService, 'readFile');
            readFile.mockImplementation(async () => Buffer.from([0]));
            const imageService = new ImageServiceImpl({ ...services });
            for (const { path, mediaType } of [
                { path: '/a', mediaType: '' },
                { path: '/a.JPG', mediaType: 'image/jpeg' },
                { path: '/a.jpg', mediaType: 'image/jpeg' },
                { path: '/a.JPEG', mediaType: 'image/jpeg' },
                { path: '/a.jpeg', mediaType: 'image/jpeg' },
                { path: '/a.PNG', mediaType: 'image/png' },
                { path: '/a.png', mediaType: 'image/png' },
                { path: '/a.GIF', mediaType: 'image/gif' },
                { path: '/a.gif', mediaType: 'image/gif' },
                { path: '/a.WEBP', mediaType: 'image/webp' },
                { path: '/a.webp', mediaType: 'image/webp' },
                { path: '/a.SVG', mediaType: 'image/svg+xml' },
                { path: '/a.svg', mediaType: 'image/svg+xml' },
            ]) {
                const entryPath = new EntryPath(path);
                const promise = imageService.loadBlob({ entryPath, fileSystem });
                await expect(promise).resolves.toBeInstanceOf(Blob);
                await expect(promise).resolves.toMatchObject({ type: mediaType });
            }
        });
    });

    describe('imageService.loadImage() method', () => {
        afterEach(() => {
            Reflect.deleteProperty(HTMLImageElement.prototype, 'onload');
            Reflect.deleteProperty(HTMLImageElement.prototype, 'onerror');
        });

        test('it loads the image', async () => {
            const entryPath = new EntryPath('/a.jpeg');
            const imageService = new ImageServiceImpl({ ...services });
            const loadBlob = jest.spyOn(imageService, 'loadBlob');
            loadBlob.mockImplementation(async () => new Blob([Buffer.from([0])], { type: 'image/jpeg' }));
            const setOnLoad = jest.fn();
            Object.defineProperty(HTMLImageElement.prototype, 'onload', {
                configurable: true,
                set: (value) => setOnLoad(value),
            });
            const closeController = new CloseController();
            const { signal } = closeController;
            const promise = imageService.loadImage({ entryPath, fileSystem, signal });
            await immediate();
            expect(setOnLoad).toHaveBeenCalledTimes(1);
            setOnLoad.mock.calls[0][0]({ type: 'load' });
            await expect(promise).resolves.toBeInstanceOf(HTMLImageElement);
            closeController.close();
        });

        test('it throws an error if the loading image is failed', async () => {
            const entryPath = new EntryPath('/a.jpeg');
            const imageService = new ImageServiceImpl({ ...services });
            const loadBlob = jest.spyOn(imageService, 'loadBlob');
            loadBlob.mockImplementation(async () => new Blob([Buffer.from([0])], { type: 'image/jpeg' }));
            const setOnError = jest.fn();
            Object.defineProperty(HTMLImageElement.prototype, 'onerror', {
                configurable: true,
                set: (value) => setOnError(value),
            });
            const promise = imageService.loadImage({ entryPath, fileSystem });
            await immediate();
            expect(setOnError).toHaveBeenCalledTimes(1);
            setOnError.mock.calls[0][0]({ type: 'error' });
            await expect(promise).rejects.toThrow();
        });
    });
});
