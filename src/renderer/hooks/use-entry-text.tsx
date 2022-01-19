import type { FileEntry } from '../../common/entities/entry';
import { FileSystem } from '../../common/entities/file-system';
import { useEntryService } from '../contexts/entry-service-context';
import { useTask } from './use-task';

export type Params = {
    entry: FileEntry;
    fileSystem: FileSystem;
};

export const useEntryText = (params: Params) => {
    const { entry, fileSystem } = params;

    const entryService = useEntryService();

    const [text = null] = useTask(async (signal) => {
        const buffer = await entryService.readFile({ entry, fileSystem, signal });
        const text = buffer.toString('utf8');
        return text;
    }, [entry, fileSystem]);

    return text;
};
