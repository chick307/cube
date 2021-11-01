import type { EntryIconService } from './entry-icon-service';

const rejectedPromise = Promise.reject(Error());
rejectedPromise.catch(() => {});

export const createEntryIconService = () => {
    const entryIconService: EntryIconService = {
        getDirectoryEntryIconUrl: () => rejectedPromise,
        getEntryIconUrl: () => rejectedPromise,
        getFileEntryIconUrl: () => rejectedPromise,
    };

    return {
        entryIconService,
    };
};
