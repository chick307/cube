import { DirectoryEntry, Entry } from '../../common/entities/entry';
import { LocalEntryService } from './local-entry-service';

export const createLocalEntryService = (): LocalEntryService => {
    return {
        createEntryFromPath: async ({ entryPath }) => new Entry(entryPath),
        getHomeDirectoryEntry: () => DirectoryEntry.fromJson({ path: '/home' }),
        readDirectory: async () => [],
        readFile: async () => Buffer.from([]),
        readLink: async () => ({ entry: null, linkString: '' }),
    };
};
