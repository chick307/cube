import { DirectoryEntry } from '../../common/entities/entry';
import type { LocalEntryService } from './local-entry-service';

const rejectedPromise = Promise.reject(Error());
rejectedPromise.catch(() => {});

export const createLocalEntryService = () => {
    const localEntryService: LocalEntryService = {
        createEntryFromPath: () => rejectedPromise,
        getHomeDirectoryEntry: () => DirectoryEntry.fromJson({ path: '/home' }),
        readDirectory: () => rejectedPromise,
        readFile: () => rejectedPromise,
        readLink: () => rejectedPromise,
    };

    return { localEntryService };
};
