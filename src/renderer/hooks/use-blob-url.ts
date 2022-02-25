import React from 'react';

import type { FileEntry } from '../../common/entities/entry';
import type { FileSystem } from '../../common/entities/file-system';
import type { EntryService } from '../services/entry-service';
import { useService } from './use-service';
import { useTask } from './use-task';

export type Parameters = {
    entry: FileEntry;
    fileSystem: FileSystem;
    type?: string | null;
};

export const useBlobUrl = (params: Parameters) => {
    const { entry, fileSystem, type: originalType } = params;
    const type = originalType ?? 'application/octet-stream';

    const entryService = useService('entryService');

    const [buffer] = useTask(async (signal) => {
        const buffer = await entryService.readFile({ entry, fileSystem, signal });
        return buffer;
    }, [entry, fileSystem]);

    const url = React.useMemo(() => {
        if (buffer == null)
            return null;
        const blob = new Blob([buffer], { type });
        const url = URL.createObjectURL(blob);
        return url;
    }, [buffer, type]);

    React.useEffect(() => {
        if (url === null)
            return;
        return () => {
            URL.revokeObjectURL(url);
        };
    }, [url]);

    return url;
};

declare module './use-service' {
    interface Services {
        'hooks/use-blob-url': {
            entryService: EntryService;
        };
    }
}
