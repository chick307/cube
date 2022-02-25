import type { FileEntry } from '../../common/entities/entry';
import type { FileSystem } from '../../common/entities/file-system';
import type { EntryService } from '../services/entry-service';
import { useService } from './use-service';
import { useTask } from './use-task';

export type Params = {
    entry: FileEntry;
    fileSystem: FileSystem;
};

export const useEntryText = (params: Params) => {
    const { entry, fileSystem } = params;

    const entryService = useService('entryService');

    const [text = null] = useTask(async (signal) => {
        const buffer = await entryService.readFile({ entry, fileSystem, signal });
        const text = buffer.toString('utf8');
        return text;
    }, [entry, fileSystem]);

    return text;
};

declare module './use-service' {
    interface Services {
        'hooks/use-entry-text': {
            entryService: EntryService;
        };
    }
}
