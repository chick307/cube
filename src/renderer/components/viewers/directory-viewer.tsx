import React from 'react';

import type { Entry } from '../../../common/entities/entry';
import type { FileSystem } from '../../../common/entities/file-system';
import { DirectoryViewerState } from '../../../common/values/viewer-state';
import type { HistoryController } from '../../controllers/history-controller';
import type { DirectoryViewerControllerFactory } from '../../factories/viewer-controller-factory';
import { useStatusBarGateway } from '../../gateways/status-bar-gateway';
import { useContextMenu } from '../../hooks/use-context-menu';
import { useRestate } from '../../hooks/use-restate';
import { useService } from '../../hooks/use-service';
import { EntryDraggable } from '../entry/entry-draggable';
import { EntryIcon } from '../entry/entry-icon';
import styles from './directory-viewer.module.css';

export type Props = {
    className?: string;
    entry: Entry;
    fileSystem: FileSystem;
    viewerState: DirectoryViewerState;
};

export const DirectoryViewer = (props: Props) => {
    const {
        className: classNameProp,
        entry, fileSystem,
        viewerState,
    } = props;

    const historyController = useService('historyController');
    const viewerControllerFactory = useService('viewerControllerFactory');
    const StatusBarGateway = useStatusBarGateway();

    const viewerController = React.useMemo(() => {
        return viewerControllerFactory.createDirectoryViewerController({ historyController });
    }, [viewerControllerFactory, historyController]);

    viewerController.initialize({ entry, fileSystem, viewerState });

    const {
        hiddenEntryCount,
        hiddenEntryVisible,
        itemCount,
        items,
        randomItemOpenable,
    } = useRestate(viewerController.state);

    const className = classNameProp == null ? styles.directoryViewer : `${classNameProp} ${styles.directoryViewer}`;

    const onItemDoubleClick = React.useCallback((event: React.MouseEvent) => {
        const target = event.target as HTMLElement;
        const itemId = target.closest<HTMLElement>('[data-item-id]')?.dataset.itemId;
        if (itemId == null)
            return;
        viewerController.openItem({ itemId });
    }, [viewerController]);

    const itemElements = React.useMemo(() => {
        return items.map(({ entry, id }) => {
            return (
                <li key={id} className={styles.listItem} data-item-id={id}>
                    <EntryDraggable {...{ fileSystem }} path={entry.path} type={entry.type}>
                        <span className={styles.entryNameContainer}>
                            <EntryIcon className={styles.icon} {...{ entryPath: entry.path, fileSystem }} />
                            <span className={styles.entryName}>
                                {entry.name.toString()}
                            </span>
                        </span>
                    </EntryDraggable>
                </li>
            );
        });
    }, [fileSystem, items]);

    const ItemCountContextMenu = useContextMenu(() => {
        return [
            {
                id: 'openRandomItem',
                label: 'Random',
                enabled: randomItemOpenable,
                onClicked: () => viewerController.openRandomItem(),
            },
            {
                id: 'toggleHiddenEntryVisible',
                label: `${hiddenEntryVisible ? 'Hide' : 'Show'} Hidden Entry (${hiddenEntryCount})`,
                onClicked: () => viewerController.toggleHiddenEntryVisible(),
            },
        ];
    }, [hiddenEntryCount, hiddenEntryVisible, randomItemOpenable, viewerController]);

    return (
        <div {...{ className }}>
            <ul className={styles.list} onDoubleClick={onItemDoubleClick}>
                {itemElements}
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
        'components/viewers/directory-viewer': {
            historyController: HistoryController;

            viewerControllerFactory: DirectoryViewerControllerFactory;
        };
    }
}
