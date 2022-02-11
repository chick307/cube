import type { FileEntry } from '../../../common/entities/entry';
import type { FileSystem } from '../../../common/entities/file-system';
import { useService } from '../../hooks/use-service';
import { useTask } from '../../hooks/use-task';
import type { EntryService } from '../../services/entry-service';
import styles from './binary-entry-view.css';

export type Props = {
    className?: string;
    entry: FileEntry;
    fileSystem: FileSystem;
};

export const BinaryEntryView = (props: Props) => {
    const { className, entry, fileSystem } = props;

    const entryService = useService('entryService');

    const [text = ''] = useTask(async (signal) => {
        const buffer = await entryService.readFile({ entry, fileSystem, signal });
        let text = '';
        let i: number;
        for (i = 0; i < buffer.length; i++) {
            if (i % 16 === 0)
                text += `${i.toString(16).toUpperCase().padStart(8, '0')}  `;
            text += buffer[i].toString(16).toUpperCase().padStart(2, '0');
            text += (i % 16 === 15) ? '\n' : (i % 8 === 7) ? '  ' : ' ';
        }
        if (i % 16 !== 0)
            text += '\n';
        return text;
    }, [entry, fileSystem]);

    return (
        <div className={`${className} ${styles.view}`}>
            <pre className={styles.content}>
                {text}
            </pre>
        </div>
    );
};

declare module '../../hooks/use-service' {
    interface Services {
        'components/entry-views/binary-entry-view': {
            entryService: EntryService;
        };
    }
}
