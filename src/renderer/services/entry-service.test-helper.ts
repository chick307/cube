import type { EntryService } from './entry-service';

const rejectedPromise = Promise.reject(Error());
rejectedPromise.catch(() => {});

export const createEntryService = () => {
    const entryService: EntryService = {
        createEntryFromPath: () => rejectedPromise,
        readDirectory: () => rejectedPromise,
        readFile: () => rejectedPromise,
        readLink: () => rejectedPromise,
    };

    return {
        entryService,
    };
};
