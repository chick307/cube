import type { DirectoryEntry } from '../../common/entities/directory-entry';
import type { Entry } from '../../common/entities/entry';
import type { FileEntry } from '../../common/entities/file-entry';
import type { FileSystem } from '../../common/entities/file-system';
import type { SymbolicLinkEntry } from '../../common/entities/symbolic-link-entry';
import type { CloseSignal } from '../../common/utils/close-controller';
import type { EntryPath } from '../../common/values/entry-path';
import type { LocalEntryService } from './local-entry-service';
import type { ZipEntryService } from './zip-entry-service';

export type CreateEntryFromPathParameters = {
    entryPath: EntryPath;
    fileSystem: FileSystem;
};

export type CreateEntryFromPathOptions = {
    signal?: CloseSignal | null;
};

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

export type Link = {
    entry: Entry | null;
    linkString: string;
};

export type EntryService = {
    createEntryFromPath(
        params: CreateEntryFromPathParameters,
        options?: CreateEntryFromPathOptions,
    ): Promise<Entry | null>;

    readDirectory(params: ReadDirectoryParameters, options?: ReadDirectoryOptions | null): Promise<Entry[]>;

    readFile(params: ReadFileParameters, options?: ReadFileOptions | null): Promise<Buffer>;

    readLink(params: ReadLinkParameters, options?: ReadLinkOptions | null): Promise<Link>;
};

export class EntryServiceImpl implements EntryService {
    private _localEntryService: LocalEntryService;

    private _zipEntryService: ZipEntryService;

    constructor(container: {
        localEntryService: LocalEntryService;
        zipEntryService: ZipEntryService;
    }) {
        this._localEntryService = container.localEntryService;
        this._zipEntryService = container.zipEntryService;
    }

    async createEntryFromPath(
        params: CreateEntryFromPathParameters,
        options?: CreateEntryFromPathOptions,
    ): Promise<Entry | null> {
        const { entryPath, fileSystem } = params;

        if (fileSystem.isLocal()) {
            return this._localEntryService.createEntryFromPath({ entryPath }, options);
        }

        if (fileSystem.isZip()) {
            return this._zipEntryService.createEntryFromPath({ entryPath, entryService: this, fileSystem }, options);
        }

        throw Error('Unknown file system');
    }

    async readDirectory(params: ReadDirectoryParameters, options?: ReadDirectoryOptions | null): Promise<Entry[]> {
        const { entry, fileSystem } = params;
        const { signal } = options ?? {};

        if (fileSystem.isLocal()) {
            return this._localEntryService.readDirectory({ entry }, { signal });
        }

        if (fileSystem.isZip()) {
            return this._zipEntryService.readDirectory({ entry, entryService: this, fileSystem }, { signal });
        }

        throw Error('Unknown file system');
    }

    async readFile(params: ReadFileParameters, options?: ReadFileOptions | null): Promise<Buffer> {
        const { entry, fileSystem } = params;
        const { signal } = options ?? {};

        if (fileSystem.isLocal()) {
            return this._localEntryService.readFile({ entry }, { signal });
        }

        if (fileSystem.isZip()) {
            return this._zipEntryService.readFile({ entry, entryService: this, fileSystem }, { signal });
        }

        throw Error('Unknown file system');
    }

    async readLink(params: ReadLinkParameters, options?: ReadLinkOptions | null): Promise<Link> {
        const { entry, fileSystem } = params;
        const { signal } = options ?? {};

        if (fileSystem.isLocal()) {
            return this._localEntryService.readLink({ entry }, { signal });
        }

        if (fileSystem.isZip()) {
            throw Error('The zip file system does not allow symbolic links');
        }

        throw Error('Unknown file system');
    }
}
