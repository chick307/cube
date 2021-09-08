import type { FileEntry } from '../../../common/entities/entry';
import type { FileSystem } from '../../../common/entities/file-system';
import { useEntryText } from '../../hooks/use-entry-text';
import styles from './css-entry-view.css';
import { Highlight } from '../highlight';

export type Props = {
    className?: string;
    entry: FileEntry;
    fileSystem: FileSystem;
};

export const CssEntryView = (props: Props) => {
    const { className = '', entry, fileSystem } = props;

    const code = useEntryText({ entry, fileSystem });
    const language = 'css';

    return (
        <div className={`${className} ${styles.view}`}>
            {code == null ? null : <Highlight className={styles.highlight} {...{ code, language }} />}
        </div>
    );
};
