import React from 'react';

import { HistoryControllerProvider } from '../contexts/history-controller-context';
import { useTabController } from '../contexts/tab-controller-context';
import type { TabState } from '../controllers/tab-controller';
import { useStatusBar } from '../gateways/status-bar-gateway';
import { useRestate } from '../hooks/use-restate';
import { composeElements } from '../utils/compose-elements';
import { EntryIcon } from './entry-icon';
import { EntryView } from './entry-view';
import { TabAddButton } from './tab/tab-add-button';
import { TabCloseButton } from './tab/tab-close-button';
import styles from './tab-view.css';
import { TabViewContextMenu } from './tab/tab-view-context-menu';
import { TabContextMenu } from './tab/tab-context-menu';

export type Props = {
    className?: string;
};

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
                {tab.title}
            </span>
            <span className={styles.tabMargin} />
            <TabCloseButton className={styles.closeButton} tabId={tab.id} />
            <span className={styles.tabMargin} />
        </div>,
    );
};

export const TabView = (props: Props) => {
    const tabController = useTabController();

    const { StatusBarProvider, StatusBarExit } = useStatusBar();

    const { tabs } = useRestate(tabController.state);

    const tabElements = tabs.map((tab) => <Tab key={tab.id} {...{ tab }} />);

    const contents = tabs.map((tab) => {
        return composeElements(
            <div key={tab.id} className={`${styles.content} ${tab.active ? styles.active : ''}`} />,
            <HistoryControllerProvider value={tab.historyController} />,
            <EntryView />,
        );
    });

    return composeElements(
        <StatusBarProvider />,
        <div className={`${styles.view} ${props.className ?? ''}`}>
            <TabViewContextMenu>
                <div className={styles.tabs}>
                    {tabElements}
                    <TabAddButton />
                </div>
            </TabViewContextMenu>
            <div className={styles.contents}>{contents}</div>
            <div className={styles.statusBar}>
                <StatusBarExit />
            </div>
        </div>,
    );
};
