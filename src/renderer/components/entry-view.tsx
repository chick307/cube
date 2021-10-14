import React from 'react';

import { useHistoryController } from '../contexts/history-controller-context';
import { useViewerService } from '../contexts/viewer-service-context';
import { useStatusBar } from '../gateways/status-bar-gateway';
import { useRestate } from '../hooks/use-restate';
import { useTask } from '../hooks/use-task';
import type { Viewer } from '../services/viewer-service';
import styles from './entry-view.css';
import { EntryPathView } from './entry/entry-path-view';
import { GoBackButton } from './go-back-button';
import { GoForwardButton } from './go-forward-button';
import { StatusBarSelect } from './status-bar/status-bar-select';

export type Props = {
    className?: string;
};

export const EntryView = (props: Props) => {
    const { className = '' } = props;

    const viewerService = useViewerService();

    const historyController = useHistoryController();

    const { current: historyItem } = useRestate(historyController.state);

    const { StatusBarExit, StatusBarProvider } = useStatusBar();

    const [viewers = []] = useTask(async (signal) => {
        const viewers = await viewerService.prioritizeViewers({
            entry: historyItem.entry,
            fileSystem: historyItem.fileSystem,
        }, { signal });
        return viewers;
    }, [historyItem.entry, historyItem.fileSystem, viewerService]);

    const { node = null, viewer = null } = React.useMemo(() => {
        const viewer = viewerService.selectViewer({ historyItem, viewers });
        if (viewer === null)
            return { node: null, viewer: null };
        if (!viewer.canRender(historyItem)) {
            const newHistoryItem = viewer.redirect(historyItem);
            historyController.replace(newHistoryItem);
            return { node: null, viewer };
        }
        const node = viewer.render(historyItem);
        return { node, viewer };
    }, [historyController, historyItem, viewerService, viewers]);

    const onViewerSelected = React.useCallback((viewer: Viewer | null) => {
        if (viewer === null)
            return;
        const newHistoryItem = viewer.redirect(historyItem);
        historyController.replace(newHistoryItem);
    }, [historyController, historyItem, viewers, viewerService]);

    const viewerId = viewer?.id ?? '-';
    const viewerOptions = StatusBarSelect.useOptions<Viewer | null>(() => {
        return viewers
            .map((viewer) => ({ label: viewer.name, value: viewer as Viewer | null }))
            .concat(viewerId === '-' ? [{ label: '-', value: null }] : []);
    }, [viewerId, viewers]);

    return (
        <div key={historyItem.entry.path.toString()} className={`${className} ${styles.entryView}`}>
            <div className={styles.path}>
                <GoBackButton className={styles.goBackButton} />
                <GoForwardButton className={styles.goForwardButton} />
                <EntryPathView entry={historyItem.entry} fileSystem={historyItem.fileSystem} />
            </div>
            <div className={styles.viewContainer}>
                <StatusBarProvider>
                    {node}
                </StatusBarProvider>
            </div>
            <div className={styles.statusBar}>
                <div className={styles.entryViewStatusBar}>
                    <StatusBarExit />
                </div>
                <StatusBarSelect options={viewerOptions} value={viewer} onChange={onViewerSelected} />
            </div>
        </div>
    );
};
