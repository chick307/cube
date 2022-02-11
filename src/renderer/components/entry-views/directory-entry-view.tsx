import React from 'react';

import type { DirectoryEntry, Entry } from '../../../common/entities/entry';
import type { FileSystem } from '../../../common/entities/file-system';
import { HistoryItem } from '../../../common/entities/history-item';
import { DirectoryViewerState } from '../../../common/values/viewer-state';
import type { HistoryController } from '../../controllers/history-controller';
import { useStatusBarGateway } from '../../gateways/status-bar-gateway';
import { useContextMenu } from '../../hooks/use-context-menu';
import { useService } from '../../hooks/use-service';
import { useTask } from '../../hooks/use-task';
import type { EntryService } from '../../services/entry-service';
import { EntryDraggable } from '../entry/entry-draggable';
import { EntryIcon } from '../entry/entry-icon';
import styles from './directory-entry-view.css';

export type Props = {
    className?: string;
    entry: DirectoryEntry;
    fileSystem: FileSystem;
    viewerState: DirectoryViewerState;
};

const iconPlaceholder = <span className={styles.iconPlaceholder}></span>;

const DirectoryItemView = (props: {
    entry: Entry;
    fileSystem: FileSystem;
}) => {
    const { entry, fileSystem } = props;

    const historyController = useService('historyController');

    const itemRef = React.useRef<HTMLElement>(null);

    const onDoubleClick = React.useCallback(() => {
        historyController.navigate(new HistoryItem({ entry, fileSystem }));
    }, [entry, fileSystem]);

    return (
        <EntryDraggable {...{ fileSystem }} path={entry.path} type={entry.type}>
            <span ref={itemRef} className={styles.entryNameContainer} {...{ onDoubleClick }}>
                <EntryIcon className={styles.icon} {...{ entryPath: entry.path, fileSystem, iconPlaceholder }} />
                <span className={styles.entryName}>
                    {entry.name.toString()}
                </span>
            </span>
        </EntryDraggable>
    );
};

export const DirectoryEntryView = (props: Props) => {
    const { className, entry, fileSystem, viewerState } = props;

    const { hiddenEntriesVisible } = viewerState;

    const entryService = useService('entryService');

    const [allEntries = []] = useTask(async (signal) => {
        const allEntries = await entryService.readDirectory({ entry, fileSystem, signal });
        return allEntries;
    }, [entry, entryService, fileSystem]);

    const { entries, hiddenEntriesCount } = React.useMemo(() => {
        const entries: Entry[] = [];
        let hiddenEntriesCount = 0;
        for (const entry of allEntries) {
            if (entry.name.startsWithDot()) {
                if (hiddenEntriesVisible)
                    entries.push(entry);
                hiddenEntriesCount++;
            } else {
                entries.push(entry);
            }
        }
        return { entries, hiddenEntriesCount };
    }, [allEntries, hiddenEntriesVisible]);

    const itemCount = React.useMemo(() => {
        if (entries.length === 1)
            return '1 item';
        return `${entries.length} items`;
    }, [entries.length]);

    const StatusBarGateway = useStatusBarGateway();

    const historyController = useService('historyController');

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
            {
                label: (
                    `${hiddenEntriesVisible ? 'Hide' : 'Show'} ` +
                    'Hidden Files' +
                    ` (${hiddenEntriesCount} item${hiddenEntriesCount === 1 ? '' : 's'})`
                ),
                onClicked: () => {
                    const viewerState = props.viewerState.toggleHiddenFilesVisible();
                    const historyItem = new HistoryItem({ entry, fileSystem, viewerState });
                    historyController.replace(historyItem);
                },
            },
        ];
    }, [entries, fileSystem, historyController, viewerState]);

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

declare module '../../hooks/use-service' {
    interface Services {
        'components/entry-views/directory-entry-view': {
            entryService: EntryService;

            historyController: HistoryController;
        };
    }
}
