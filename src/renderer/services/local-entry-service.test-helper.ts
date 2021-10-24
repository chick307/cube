import { DirectoryEntry } from '../../common/entities/entry';
import { DummyEntry } from '../../common/entities/entry.test-helper';
import { LocalEntryService } from './local-entry-service';

export const createLocalEntryService = (): LocalEntryService => {
    return {
        createEntryFromPath: async ({ entryPath }) => new DummyEntry(entryPath),
        getHomeDirectoryEntry: () => DirectoryEntry.fromJson({ path: '/home' }),
        readDirectory: async () => [],
        readFile: async () => Buffer.from([]),
        readLink: async () => ({ entry: null, linkString: '' }),
    };
};
