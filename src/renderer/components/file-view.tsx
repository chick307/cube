import { FileEntry } from '../../common/entities/file-entry';
import { FileSystem as FileSystemService } from '../services/file-system';
import { BinaryFileView } from './binary-file-view';
import styles from './file-view.css';

export type Props = {
    className?: string;
    entry: FileEntry;
    fileSystem: FileSystemService;
};

export const FileView = (props: Props) => {
    const { className = '', entry, fileSystem } = props;

    const view =
        <BinaryFileView className={styles.view} {...{ entry, fileSystem }} />;

    return <>
        <div className={`${className} ${styles.viewContainer}`}>
            {view}
        </div>
    </>;
};
