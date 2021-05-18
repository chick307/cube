import type { FileEntry } from '../../../common/entities/file-entry';
import type { FileSystem } from '../../../common/entities/file-system';
import { useEntryText } from '../../hooks/use-entry-text';
import styles from './javascript-entry-view.css';
import { Highlight } from '../highlight';

export type Props = {
    className?: string;
    entry: FileEntry;
    fileSystem: FileSystem;
};

export const JavaScriptEntryView = (props: Props) => {
    const { className = '', entry, fileSystem } = props;

    const code = useEntryText({ entry, fileSystem });
    const language = 'javascript';

    return (
        <div className={`${className} ${styles.view}`}>
            {code == null ? null : <Highlight className={styles.highlight} {...{ code, language }} />}
        </div>
    );
};

export const isJavaScriptEntry = (entry: FileEntry) =>
    /^\.(?:jsx?)$/i.test(entry.path.getExtension());
