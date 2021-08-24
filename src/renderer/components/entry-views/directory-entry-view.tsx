import React from 'react';

import type { DirectoryEntry, Entry } from '../../../common/entities/entry';
import type { FileSystem } from '../../../common/entities/file-system';
import { HistoryItem } from '../../../common/entities/history-item';
import { useEntryService } from '../../contexts/entry-service-context';
import { useHistoryController } from '../../contexts/history-controller-context';
import { useStatusBarGateway } from '../../gateways/status-bar-gateway';
import { useContextMenu } from '../../hooks/use-context-menu';
import { useTask } from '../../hooks/use-task';
import { EntryIcon } from '../entry-icon';
import styles from './directory-entry-view.css';

export type Props = {
    className?: string;
    entry: DirectoryEntry;
    fileSystem: FileSystem;
};

const iconPlaceholder = <span className={styles.iconPlaceholder}></span>;

const DirectoryItemView = (props: {
    entry: Entry;
    fileSystem: FileSystem;
}) => {
    const { entry, fileSystem } = props;

    const historyController = useHistoryController();

    const onClick = React.useCallback(() => {
        historyController.navigate(new HistoryItem({ entry, fileSystem }));
    }, [entry, fileSystem]);

    return (
        <span className={styles.entryNameContainer} onDoubleClick={onClick}>
            <EntryIcon className={styles.icon} entry={entry} iconPlaceholder={iconPlaceholder} />
            <span className={styles.entryName}>
                {entry.name.toString()}
            </span>
        </span>
    );
};

export const DirectoryEntryView = (props: Props) => {
    const { className, entry, fileSystem } = props;

    const entryService = useEntryService();

    const [entries = []] = useTask(async (signal) => {
        const entries = await entryService.readDirectory({ entry, fileSystem }, { signal });
        return entries.filter((entry) => !entry.path.name.toString().startsWith('.'));
    }, [entry, entryService, fileSystem]);

    const itemCount = React.useMemo(() => {
        if (entries.length === 1)
            return '1 item';
        return `${entries.length} items`;
    }, [entries.length]);

    const StatusBarGateway = useStatusBarGateway();

    const historyController = useHistoryController();

    const ItemCountContextMenu = useContextMenu(() => {
        return [
            {
                label: 'Random',
                enabled: entries.length !== 0,
                onClicked: () => {
                    const entry = entries[Math.random() * entries.length | 0];
                    const historyItem = new HistoryItem({ entry, fileSystem });
                    historyController.navigate(historyItem);
                },
            },
        ];
    }, [entries, fileSystem, historyController]);

    return (
        <div className={`${className} ${styles.view}`}>
            <ul className={styles.list}>
                {entries.map((entry) => (
                    <li key={entry.name.toString()} className={styles.listItem}>
                        <DirectoryItemView {...{ entry, fileSystem }} />
                    </li>
                ))}
            </ul>
            <StatusBarGateway>
                <ItemCountContextMenu>
                    <span className={styles.itemCount}>{itemCount}</span>
                </ItemCountContextMenu>
            </StatusBarGateway>
        </div>
    );
};
