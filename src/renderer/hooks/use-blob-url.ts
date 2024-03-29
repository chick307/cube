import { FileEntry } from '../../common/entities/file-entry';
import { FileSystem } from '../../common/entities/file-system';
import { useEntryService } from '../contexts/entry-service-context';
import { useTask } from './use-task';

export type Parameters = {
    entry: FileEntry;
    fileSystem: FileSystem;
    type?: string | null;
};

export const useBlobUrl = (params: Parameters) => {
    const { entry, fileSystem, type: originalType } = params;
    const type = originalType ?? 'application/octet-stream';

    const entryService = useEntryService();

    const [buffer] = useTask(async (signal) => {
        const buffer = await entryService.readFile({ entry, fileSystem }, { signal });
        return buffer;
    }, [entry, fileSystem]);

    const [url = null] = useTask(async (signal) => {
        if (buffer == null)
            return;
        const blob = new Blob([buffer], { type });
        const url = URL.createObjectURL(blob);
        signal.defer(() => {
            URL.revokeObjectURL(url);
        });
        return url;
    }, [buffer, type]);

    return url;
};
