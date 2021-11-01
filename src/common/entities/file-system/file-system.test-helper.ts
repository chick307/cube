import { FileSystem } from '.';

export class DummyFileSystem extends FileSystem {
    readonly type = 'dummy';
}
