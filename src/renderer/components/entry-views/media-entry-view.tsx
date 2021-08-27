import type { FileEntry } from '../../../common/entities/entry';
import type { FileSystem } from '../../../common/entities/file-system';
import { useBlobUrl } from '../../hooks/use-blob-url';
import styles from './media-entry-view.css';

export type Props = {
    className?: string;
    entry: FileEntry;
    fileSystem: FileSystem;
};

export const MediaEntryView = (props: Props) => {
    const { className = '', entry, fileSystem } = props;

    const url = useBlobUrl({ entry, fileSystem });

    if (url == null) {
        return (
            <div className={`${className} ${styles.view}`} />
        );
    }

    return (
        <div className={`${className} ${styles.player}`}>
            <video className={styles.media} src={url} controls />
        </div>
    );
};

export const isMediaEntry = (entry: FileEntry) =>
    /\.(?:m4a|mp[34]|wav)/.test(entry.path.getExtension());
