import { FileSystem } from '../file-system';

export class DummyFileSystem extends FileSystem {
    readonly type = 'dummy';
}
