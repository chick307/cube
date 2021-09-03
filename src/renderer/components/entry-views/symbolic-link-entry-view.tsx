import React from 'react';

import type { SymbolicLinkEntry } from '../../../common/entities/entry';
import type { FileSystem } from '../../../common/entities/file-system';
import { HistoryItem } from '../../../common/entities/history-item';
import { useEntryService } from '../../contexts/entry-service-context';
import { useHistoryController } from '../../contexts/history-controller-context';
import { useTask } from '../../hooks/use-task';
import { EntryIcon } from '../entry-icon';
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

    const entryService = useEntryService();

    const historyController = useHistoryController();

    const [link] = useTask(async (signal) => {
        const link = await entryService.readLink({ entry, fileSystem }, { signal });
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
                        <EntryIcon entry={link.entry} {...{ iconPlaceholder }} />
                    </span>
                    <span className={styles.destPath} {...{ onClick }}>
                        {link.entry.path.toString()}
                    </span>
                </div>
            )}
        </div>
    );
};
