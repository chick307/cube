import type { DirectoryEntry } from '../../common/entities/directory-entry';
import type { Entry } from '../../common/entities/entry';
import type { FileEntry } from '../../common/entities/file-entry';
import type { FileSystem } from '../../common/entities/file-system';
import type { SymbolicLinkEntry } from '../../common/entities/symbolic-link-entry';
import type { CloseSignal } from '../../common/utils/close-controller';
import type { LocalEntryService } from './local-entry-service';

export type ReadDirectoryParameters = {
    entry: DirectoryEntry;
    fileSystem: FileSystem;
};

export type ReadDirectoryOptions = {
    signal?: CloseSignal | null;
};

export type ReadFileParameters = {
    entry: FileEntry;
    fileSystem: FileSystem;
};

export type ReadFileOptions = {
    signal?: CloseSignal | null;
};

export type ReadLinkParameters = {
    entry: SymbolicLinkEntry;
    fileSystem: FileSystem;
};

export type ReadLinkOptions = {
    signal?: CloseSignal | null;
};

export type EntryService = {
    readDirectory(params: ReadDirectoryParameters, options?: ReadDirectoryOptions | null): Promise<Entry[]>;
    readFile(params: ReadFileParameters, options?: ReadFileOptions | null): Promise<Buffer>;
    readLink(params: ReadLinkParameters, options?: ReadLinkOptions | null): Promise<Entry>;
};

export class EntryServiceImpl implements EntryService {
    private _localEntryService: LocalEntryService;

    constructor(container: {
        localEntryService: LocalEntryService;
    }) {
        this._localEntryService = container.localEntryService;
    }

    async readDirectory(params: ReadDirectoryParameters, options?: ReadDirectoryOptions | null): Promise<Entry[]> {
        const { entry, fileSystem } = params;
        const { signal } = options ?? {};

        if (fileSystem.isLocal()) {
            return this._localEntryService.readDirectory({ entry }, { signal });
        }

        throw Error('Unknown file system');
    }

    async readFile(params: ReadFileParameters, options?: ReadFileOptions | null): Promise<Buffer> {
        const { entry, fileSystem } = params;
        const { signal } = options ?? {};

        if (fileSystem.isLocal()) {
            return this._localEntryService.readFile({ entry }, { signal });
        }

        throw Error('Unknown file system');
    }

    async readLink(params: ReadLinkParameters, options?: ReadLinkOptions | null): Promise<Entry> {
        const { entry, fileSystem } = params;
        const { signal } = options ?? {};

        if (fileSystem.isLocal()) {
            return this._localEntryService.readLink({ entry }, { signal });
        }

        throw Error('Unknown file system');
    }
}
