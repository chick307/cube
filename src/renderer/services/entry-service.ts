import type { DirectoryEntry, Entry, FileEntry, SymbolicLinkEntry } from '../../common/entities/entry';
import type { FileSystem } from '../../common/entities/file-system';
import type { CloseSignal } from '../../common/utils/close-controller';
import type { EntryPath } from '../../common/values/entry-path';
import type { LocalEntryService } from './local-entry-service';
import type { ZipEntryService } from './zip-entry-service';

export type Link = {
    entry: Entry | null;
    linkString: string;
};

export type EntryService = {
    createEntryFromPath(params: CreateEntryFromPathParams): Promise<Entry | null>;

    readDirectory(params: ReadDirectoryParams): Promise<Entry[]>;

    readFile(params: ReadFileParams): Promise<Buffer>;

    readLink(params: ReadLinkParams): Promise<Link>;
};

export type CreateEntryFromPathParams = {
    entryPath: EntryPath;

    fileSystem: FileSystem;

    signal?: CloseSignal | null | undefined;
};

export type ReadDirectoryParams = {
    entry: DirectoryEntry;

    fileSystem: FileSystem;

    signal?: CloseSignal | null;
};

export type ReadFileParams = {
    entry: FileEntry;

    fileSystem: FileSystem;

    signal?: CloseSignal | null;
};

export type ReadLinkParams = {
    entry: SymbolicLinkEntry;

    fileSystem: FileSystem;

    signal?: CloseSignal | null;
};

export class EntryServiceImpl implements EntryService {
    #localEntryService: LocalEntryService;

    #zipEntryService: ZipEntryService;

    constructor(params: {
        readonly localEntryService: LocalEntryService;
        readonly zipEntryService: ZipEntryService;
    }) {
        this.#localEntryService = params.localEntryService;
        this.#zipEntryService = params.zipEntryService;
    }

    async createEntryFromPath(params: CreateEntryFromPathParams): Promise<Entry | null> {
        const { entryPath, fileSystem, signal } = params;

        if (fileSystem.isLocal()) {
            return this.#localEntryService.createEntryFromPath({ entryPath, signal });
        }

        if (fileSystem.isZip()) {
            return this.#zipEntryService.createEntryFromPath({ entryPath, entryService: this, fileSystem, signal });
        }

        throw Error('Unknown file system');
    }

    async readDirectory(params: ReadDirectoryParams): Promise<Entry[]> {
        const { entry, fileSystem, signal } = params;

        if (fileSystem.isLocal()) {
            return this.#localEntryService.readDirectory({ entry, signal });
        }

        if (fileSystem.isZip()) {
            return this.#zipEntryService.readDirectory({ entry, entryService: this, fileSystem, signal });
        }

        throw Error('Unknown file system');
    }

    async readFile(params: ReadFileParams): Promise<Buffer> {
        const { entry, fileSystem, signal } = params;

        if (fileSystem.isLocal()) {
            return this.#localEntryService.readFile({ entry, signal });
        }

        if (fileSystem.isZip()) {
            return this.#zipEntryService.readFile({ entry, entryService: this, fileSystem, signal });
        }

        throw Error('Unknown file system');
    }

    async readLink(params: ReadLinkParams): Promise<Link> {
        const { entry, fileSystem, signal } = params;

        if (fileSystem.isLocal()) {
            return this.#localEntryService.readLink({ entry, signal });
        }

        if (fileSystem.isZip()) {
            throw Error('The zip file system does not allow symbolic links');
        }

        throw Error('Unknown file system');
    }
}
