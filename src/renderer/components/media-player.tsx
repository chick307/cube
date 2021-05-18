import { FileEntry } from '../../common/entities/file-entry';
import { FileSystem } from '../../common/entities/file-system';
import { useBlobUrl } from '../hooks/use-blob-url';
import styles from './media-player.css';

export type Props = {
    className?: string;
    entry: FileEntry;
    fileSystem: FileSystem;
};

export const MediaPlayer = (props: Props) => {
    const { className = '', entry, fileSystem } = props;

    const url = useBlobUrl({ entry, fileSystem });

    if (url == null) {
        return <>
            <div className={`${className} ${styles.player}`} />
        </>;
    }

    return <>
        <div className={`${className} ${styles.player}`}>
            <video className={styles.media} src={url} controls />
        </div>
    </>;
};

export const isMediaEntry = (entry: FileEntry) =>
    /\.(?:m4a|mp[34]|wav)/.test(entry.path.getExtension());
