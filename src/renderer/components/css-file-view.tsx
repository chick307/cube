import { FileEntry } from '../../common/entities/file-entry';
import { FileSystem } from '../../common/entities/file-system';
import { useEntryText } from '../hooks/use-entry-text';
import styles from './css-file-view.css';
import { Highlight } from './highlight';

export type Props = {
    className?: string;
    entry: FileEntry;
    fileSystem: FileSystem;
};

export const CssFileView = (props: Props) => {
    const { className = '', entry, fileSystem } = props;

    const code = useEntryText({ entry, fileSystem });
    const language = 'css';

    return (
        <div className={`${className} ${styles.view}`}>
            {code == null ? null : <Highlight className={styles.highlight} {...{ code, language }} />}
        </div>
    );
};

export const isCssEntry = (entry: FileEntry) =>
    /^\.(?:css)$/i.test(entry.path.getExtension());
