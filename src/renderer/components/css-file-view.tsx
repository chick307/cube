import { FileEntry } from '../../common/entities/file-entry';
import { FileSystem } from '../../common/entities/file-system';
import { useEntryService } from '../contexts/entry-service-context';
import { useTask } from '../hooks/use-task';
import styles from './css-file-view.css';
import { Highlight } from './highlight';

export type Props = {
    className?: string;
    entry: FileEntry;
    fileSystem: FileSystem;
};

export const CssFileView = (props: Props) => {
    const { className = '', entry, fileSystem } = props;

    const entryService = useEntryService();

    const language = 'css';
    const [code] = useTask(async (signal) => {
        const buffer = await entryService.readFile({ entry, fileSystem }, { signal });
        const text = buffer.toString('utf8');
        return text;
    }, [entry, entryService, fileSystem]);

    return (
        <div className={`${className} ${styles.view}`}>
            {code == null ? null : <Highlight className={styles.highlight} {...{ code, language }} />}
        </div>
    );
};

export const isCssEntry = (entry: FileEntry) =>
    /^\.(?:css)$/i.test(entry.path.getExtension());
