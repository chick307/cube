import React from 'react';

import type { SymbolicLinkEntry } from '../../../common/entities/entry';
import type { FileSystem } from '../../../common/entities/file-system';
import { HistoryItem } from '../../../common/entities/history-item';
import type { HistoryController } from '../../controllers/history-controller';
import { useService } from '../../hooks/use-service';
import { useTask } from '../../hooks/use-task';
import type { EntryService } from '../../services/entry-service';
import { EntryIcon } from '../entry/entry-icon';
import styles from './symbolic-link-entry-view.css';

const iconPlaceholder = (
    <span className={styles.iconPlaceholder} />
);

export type Props = {
    className?: string;
    entry: SymbolicLinkEntry;
    fileSystem: FileSystem;
};

export const SymbolicLinkEntryView = (props: Props) => {
    const { className = '', entry, fileSystem } = props;

    const entryService = useService('entryService');

    const historyController = useService('historyController');

    const [link] = useTask(async (signal) => {
        const link = await entryService.readLink({ entry, fileSystem, signal });
        return link;
    }, [entry, entryService, fileSystem]);

    const onClick = React.useCallback(() => {
        if (link?.entry == null)
            return;
        historyController.navigate(new HistoryItem({ entry: link.entry, fileSystem }));
    }, [link]);

    if (link == null)
        return <></>;

    return (
        <div className={`${className} ${styles.view}`}>
            <div className={styles.linkString}>
                {link.linkString}
            </div>
            {link.entry == null ? null : (
                <div className={styles.destContainer}>
                    <span className={styles.arrow}>&rarr;</span>
                    <span className={styles.iconContainer} {...{ onClick }}>
                        <EntryIcon {...{ entryPath: link.entry.path, fileSystem, iconPlaceholder }} />
                    </span>
                    <span className={styles.destPath} {...{ onClick }}>
                        {link.entry.path.toString()}
                    </span>
                </div>
            )}
        </div>
    );
};

declare module '../../hooks/use-service' {
    interface Services {
        'components/entry-views/symbolic-link-entry-view': {
            entryService: EntryService;

            historyController: HistoryController;
        };
    }
}
