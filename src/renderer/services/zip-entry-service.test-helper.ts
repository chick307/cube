import type { ZipEntryService } from './zip-entry-service';

const rejectedPromise = Promise.reject(Error());
rejectedPromise.catch(() => {});

export const createZipEntryService = () => {
    const zipEntryService: ZipEntryService = {
        createEntryFromPath: () => rejectedPromise,
        readDirectory: () => rejectedPromise,
        readFile: () => rejectedPromise,
    };

    return { zipEntryService };
};
