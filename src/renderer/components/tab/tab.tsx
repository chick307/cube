import React from 'react';

import type { HistoryItem } from '../../../common/entities/history-item';
import { useTabController } from '../../contexts/tab-controller-context';
import type { TabState } from '../../controllers/tab-controller';
import { composeElements } from '../../utils/compose-elements';
import { EntryIcon } from '../entry/entry-icon';
import { EntryDropArea } from '../entry/entry-drop-area';
import { TabCloseButton } from './tab-close-button';
import { TabContextMenu } from './tab-context-menu';
import styles from './tab.module.css';
import { TabViewDragOverIndicator } from './tab-view-drag-over-indicator';

export type Props = {
    tab: TabState;
};

export const Tab = (props: Props) => {
    const { tab } = props;

    const tabController = useTabController();

    const className = `${styles.tab} ${tab.active ? styles.active : ''}`;

    const onAuxClick = React.useCallback(() => {
        tabController.removeTab({ id: tab.id });
    }, [tabController]);

    const onClick = React.useCallback(() => {
        tabController.selectTab({ id: tab.id });
    }, [tabController]);

    const onEntryDrop = React.useCallback(([first, ...rest]: HistoryItem[]) => {
        const index = tabController.state.current.tabs.findIndex((t) => t.id === tab.id);
        if (rest.length > 0)
            tabController.insertTabs({ historyItems: rest, index: index + 1 });
        tab.historyController.navigate(first);
        tabController.selectTab({ id: tab.id });
    }, [tab, tabController]);

    const onEntryDropInInsertBeforeArea = React.useCallback((historyItems: HistoryItem[]) => {
        const index = tabController.state.current.tabs.findIndex((t) => t.id === tab.id);
        tabController.insertTabs({ active: true, historyItems, index });
    }, [tab, tabController]);

    const onEntryDropInInsertAfterArea = React.useCallback((historyItems: HistoryItem[]) => {
        const index = tabController.state.current.tabs.findIndex((t) => t.id === tab.id);
        tabController.insertTabs({ active: true, historyItems, index: index + 1 });
    }, [tab, tabController]);

    const { title } = tab;

    return composeElements(
        <TabContextMenu tabId={tab.id} />,
        <div key={tab.id} {...{ className, onAuxClick, onClick, title }}>
            <span className={styles.tabMargin} />
            <span className={styles.tabIcon}>
                <EntryIcon entry={tab.historyController.state.current.current.entry} />
            </span>
            <span className={styles.tabMargin} />
            <span className={styles.tabTitle}>
                {title}
            </span>
            <span className={styles.tabMargin} />
            <TabCloseButton className={styles.closeButton} tabId={tab.id} />
            <span className={styles.tabMargin} />
            <EntryDropArea dragOverClassName={styles.tabInsertBeforeAreaDragOver}
                onEntryDrop={onEntryDropInInsertBeforeArea}>
                <div className={styles.tabInsertBeforeArea}>
                    <TabViewDragOverIndicator className={styles.tabViewDragOverIndicator} />
                </div>
            </EntryDropArea>
            <EntryDropArea dragOverClassName={styles.tabNavigateAreaDragOver} {...{ onEntryDrop }}>
                <div className={styles.tabNavigateArea}>
                    <TabViewDragOverIndicator className={styles.tabViewDragOverIndicator} />
                </div>
            </EntryDropArea>
            <EntryDropArea dragOverClassName={styles.tabInsertAfterAreaDragOver}
                onEntryDrop={onEntryDropInInsertAfterArea}>
                <div className={styles.tabInsertAfterArea}>
                    <TabViewDragOverIndicator className={styles.tabViewDragOverIndicator} />
                </div>
            </EntryDropArea>
        </div>,
    );
};
