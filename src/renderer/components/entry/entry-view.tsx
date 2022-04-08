import React from 'react';

import type { HistoryController } from '../../controllers/history-controller';
import { useStatusBar } from '../../gateways/status-bar-gateway';
import { useRestate } from '../../hooks/use-restate';
import { useService } from '../../hooks/use-service';
import { useTask } from '../../hooks/use-task';
import type { Viewer, ViewerService } from '../../services/viewer-service';
import { Button } from '../button';
import { GoBackButton } from '../history/go-back-button';
import { GoForwardButton } from '../history/go-forward-button';
import { RefreshIcon } from '../icons';
import { StatusBarSelect } from '../status-bar/status-bar-select';
import { EntryPathView } from './entry-path-view';
import styles from './entry-view.module.css';

export type Props = {
    className?: string;
};

export const EntryView = (props: Props) => {
    const { className = '' } = props;

    const viewerService = useService('viewerService');

    const historyController = useService('historyController');

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

    const [refreshing, setRefreshing] = React.useState(false);

    const onRefreshButtonClick = React.useCallback(() => {
        setRefreshing(true);
    }, []);

    React.useEffect(() => {
        if (refreshing)
            setRefreshing(false);
    }, [refreshing]);

    return (
        <div key={historyItem.entry.path.toString()} className={`${className} ${styles.entryView}`}>
            <div className={styles.path}>
                <GoBackButton className={styles.goBackButton} />
                <GoForwardButton className={styles.goForwardButton} />
                <Button className={styles.refreshButton} onClick={onRefreshButtonClick}>
                    <RefreshIcon />
                </Button>
                <span className={styles.pathContainer}>
                    <EntryPathView entry={historyItem.entry} fileSystem={historyItem.fileSystem} />
                </span>
            </div>
            <div className={styles.viewContainer}>
                <StatusBarProvider>
                    {refreshing ? null : node}
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

declare module '../../hooks/use-service' {
    interface Services {
        'components/entry/entry-view': {
            historyController: HistoryController;

            viewerService: ViewerService;
        };
    }
}
