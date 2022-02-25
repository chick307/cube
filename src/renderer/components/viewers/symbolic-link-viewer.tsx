import React from 'react';

import type { Entry } from '../../../common/entities/entry';
import type { FileSystem } from '../../../common/entities/file-system';
import type { SymbolicLinkViewerState } from '../../../common/values/viewer-state';
import type { HistoryController } from '../../controllers/history-controller';
import type { SymbolicLinkViewerControllerFactory } from '../../factories/viewer-controller-factory';
import { useRestate } from '../../hooks/use-restate';
import { useService } from '../../hooks/use-service';
import { EntryIcon } from '../entry/entry-icon';
import styles from './symbolic-link-viewer.module.css';

export type Props = {
    className?: string;

    entry: Entry;

    fileSystem: FileSystem;

    viewerState: SymbolicLinkViewerState;
};

export const SymbolicLinkViewer = (props: Props) => {
    const {
        className: classNameProp,
        entry,
        fileSystem,
        viewerState,
    } = props;

    const historyController = useService('historyController');
    const viewerControllerFactory = useService('viewerControllerFactory');

    const viewerController = React.useMemo(() => {
        return viewerControllerFactory.createSymbolicLinkViewerController({ historyController });
    }, [viewerControllerFactory, historyController]);

    viewerController.initialize({ entry, fileSystem, viewerState });

    const {
        linkString,
        linkedEntry,
    } = useRestate(viewerController.state);

    const className =
        classNameProp == null ? styles.symbolicLinkViewer : `${styles.symbolicLinkViewer} ${classNameProp}`;

    const linkStringElement = React.useMemo(() => {
        if (linkString === null)
            return null;
        return (
            <div className={styles.linkString}>
                {linkString}
            </div>
        );
    }, [linkString]);

    const onLinkedEntryClick = React.useCallback(() => {
        viewerController.openLink();
    }, [viewerController]);

    const linkedEntryElement = React.useMemo(() => {
        if (linkedEntry === null)
            return null;
        return (
            <div className={styles.linkedEntry}>
                <span className={styles.arrow}>&rarr;</span>
                <span className={styles.linkedEntryIcon} onClick={onLinkedEntryClick}>
                    <EntryIcon entryPath={linkedEntry.path} {...{ fileSystem }} />
                </span>
                <span className={styles.linkedEntryPath} onClick={onLinkedEntryClick}>
                    {linkedEntry.path.toString()}
                </span>
            </div>
        );
    }, [linkedEntry, onLinkedEntryClick]);

    return (
        <div {...{ className }}>
            {linkStringElement}
            {linkedEntryElement}
        </div>
    );
};

declare module '../../hooks/use-service' {
    interface Services {
        'components/viewers/symbolic-link-viewer': {
            historyController: HistoryController;

            viewerControllerFactory: SymbolicLinkViewerControllerFactory;
        };
    }
}
