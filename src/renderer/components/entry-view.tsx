import React from 'react';

import { useHistoryController } from '../contexts/history-controller-context';
import { useViewerService } from '../contexts/viewer-service-context';
import { useStatusBar, useStatusBarGateway } from '../gateways/status-bar-gateway';
import { useRestate } from '../hooks/use-restate';
import { useTask } from '../hooks/use-task';
import styles from './entry-view.css';
import { GoBackButton } from './go-back-button';
import { GoForwardButton } from './go-forward-button';

export type Props = {
    className?: string;
};

export const EntryView = (props: Props) => {
    const { className = '' } = props;

    const viewerService = useViewerService();

    const historyController = useHistoryController();

    const { current: historyItem } = useRestate(historyController.state);

    const { StatusBarExit, StatusBarProvider } = useStatusBar();

    const StatusBarGateway = useStatusBarGateway();

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

    const onViewerSelected = React.useCallback((e: React.ChangeEvent) => {
        const target = e.target as HTMLSelectElement;
        const id = target.value;
        const viewer = viewers.find((viewer) => viewer.id === id);
        if (viewer == null)
            return;
        const newHistoryItem = viewer.redirect(historyItem);
        historyController.replace(newHistoryItem);
        target.blur();
    }, [historyItem, viewers, viewerService]);

    const viewerId = viewer?.id ?? '-';
    const viewerOptions = React.useMemo(() => {
        return viewers.map((viewer) => (
            <option key={viewer.id} value={viewer.id}>
                {viewer.name}
            </option>
        )).concat(viewerId === '-' ? [<option key={'-'} value={'-'}>-</option>] : []);
    }, [viewerId, viewers]);

    return (
        <div key={historyItem.entry.path.toString()} className={`${className} ${styles.entryView}`}>
            <div className={styles.path}>
                <GoBackButton className={styles.goBackButton} />
                <GoForwardButton className={styles.goForwardButton} />
                <span className={styles.pathString}>{historyItem.entry.path.toString()}</span>
            </div>
            <div className={styles.viewContainer}>
                <StatusBarProvider>
                    {node}
                </StatusBarProvider>
            </div>
            <StatusBarGateway>
                <div className={styles.entryViewStatusBar}>
                    <StatusBarExit />
                </div>
                <label className={styles.viewerSelectContainer}>
                    <span className={styles.viewerName}>
                        {viewer?.name ?? '-'}
                    </span>
                    <select className={styles.viewerSelect} value={viewer?.id ?? '-'} onChange={onViewerSelected}>
                        {viewerOptions}
                    </select>
                </label>
            </StatusBarGateway>
        </div>
    );
};
