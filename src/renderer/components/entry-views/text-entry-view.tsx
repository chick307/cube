import type { FileEntry } from '../../../common/entities/file-entry';
import type { FileSystem } from '../../../common/entities/file-system';
import { useEntryText } from '../../hooks/use-entry-text';
import styles from './text-entry-view.css';

export type Props = {
    className?: string;
    entry: FileEntry;
    fileSystem: FileSystem;
};

export const TextEntryView = (props: Props) => {
    const { className = '', entry, fileSystem } = props;

    const content = useEntryText({ entry, fileSystem });

    return (
        <div className={`${className} ${styles.view}`}>
            {content === null ? null : (
                <pre className={styles.text}>
                    {content}
                </pre>
            )}
        </div>
    );
};

export const isTextEntry = (entry: FileEntry) =>
    /^\.(?:txt)$/.test(entry.path.getExtension());
