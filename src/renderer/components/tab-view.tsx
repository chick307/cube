import React from 'react';

import type { HistoryItem } from '../../common/entities/history-item';
import { HistoryControllerProvider } from '../contexts/history-controller-context';
import { useTabController } from '../contexts/tab-controller-context';
import type { TabState } from '../controllers/tab-controller';
import { useStatusBar } from '../gateways/status-bar-gateway';
import { useRestate } from '../hooks/use-restate';
import { composeElements } from '../utils/compose-elements';
import { EntryIcon } from './entry-icon';
import { EntryView } from './entry-view';
import { EntryDropArea } from './entry/entry-drop-area';
import styles from './tab-view.css';
import { TabAddButton } from './tab/tab-add-button';
import { TabCloseButton } from './tab/tab-close-button';
import { TabContextMenu } from './tab/tab-context-menu';
import { TabViewContextMenu } from './tab/tab-view-context-menu';

export type Props = {
    className?: string;
};

const dragOverIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
        <polygon fillRule="evenodd" points="11 3 6 10 1 3"/>
    </svg>
);

const Tab = (props: {
    tab: TabState;
}) => {
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
                    <span className={styles.tabViewDragOverIcon}>{dragOverIcon}</span>
                </div>
            </EntryDropArea>
            <EntryDropArea dragOverClassName={styles.tabNavigateAreaDragOver} {...{ onEntryDrop }}>
                <div className={styles.tabNavigateArea}>
                    <span className={styles.tabViewDragOverIcon}>{dragOverIcon}</span>
                </div>
            </EntryDropArea>
            <EntryDropArea dragOverClassName={styles.tabInsertAfterAreaDragOver}
                onEntryDrop={onEntryDropInInsertAfterArea}>
                <div className={styles.tabInsertAfterArea}>
                    <span className={styles.tabViewDragOverIcon}>{dragOverIcon}</span>
                </div>
            </EntryDropArea>
        </div>,
    );
};

export const TabView = (props: Props) => {
    const tabController = useTabController();

    const { StatusBarProvider, StatusBarExit } = useStatusBar();

    const { tabs } = useRestate(tabController.state);

    const tabElements = React.useMemo(() => tabs.map((tab) => {
        return <Tab key={tab.id} {...{ tab }} />;
    }), [tabs]);

    const contents = React.useMemo(() => tabs.map((tab) => {
        return composeElements(
            <div key={tab.id} className={`${styles.content} ${tab.active ? styles.active : ''}`} />,
            <HistoryControllerProvider value={tab.historyController} />,
            tab.active ? <StatusBarProvider /> : <React.Fragment />,
            <EntryView />,
        );
    }), [StatusBarProvider, tabs]);

    const onEntryDropInAppendArea = React.useCallback((historyItems: HistoryItem[]) => {
        tabController.insertTabs({ active: true, historyItems, index: Infinity });
    }, [tabController]);

    const onEntryDropInPrependArea = React.useCallback((historyItems: HistoryItem[]) => {
        tabController.insertTabs({ active: true, historyItems, index: 0 });
    }, [tabController]);

    return (
        <div className={`${styles.view} ${props.className ?? ''}`}>
            <TabViewContextMenu>
                <EntryDropArea dragOverClassName={styles.tabViewDragOver}>
                    <div className={styles.tabs}>
                        <EntryDropArea dragOverClassName={styles.prependAreaDragOver}
                            onEntryDrop={onEntryDropInPrependArea}>
                            <div className={styles.prependArea}>
                                <span className={styles.tabViewDragOverIcon}>{dragOverIcon}</span>
                            </div>
                        </EntryDropArea>
                        {tabElements}
                        <EntryDropArea dragOverClassName={styles.appendAreaDragOver}
                            onEntryDrop={onEntryDropInAppendArea}>
                            <div className={styles.appendArea}>
                                <span className={styles.tabViewDragOverIcon}>{dragOverIcon}</span>
                                <TabAddButton />
                            </div>
                        </EntryDropArea>
                    </div>
                </EntryDropArea>
            </TabViewContextMenu>
            <div className={styles.contents}>{contents}</div>
            <div className={styles.statusBar}>
                <StatusBarExit />
            </div>
        </div>
    );
};
