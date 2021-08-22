import React from 'react';

import { HistoryControllerProvider } from '../contexts/history-controller-context';
import { useTabController } from '../contexts/tab-controller-context';
import { useRestate } from '../hooks/use-restate';
import { composeElements } from '../utils/compose-elements';
import { EntryView } from './entry-view';
import { TabAddButton } from './tab-add-button';
import styles from './tab-view.css';

export type Props = {
    className?: string;
};

export const TabView = (props: Props) => {
    const tabController = useTabController();

    const { tabs } = useRestate(tabController.state);

    const onTabClick = React.useCallback((event: React.MouseEvent) => {
        const tab = (event.target as HTMLElement).closest<HTMLElement>('[data-tab-id]');
        const id = parseInt(tab?.dataset.tabId ?? '0', 10);
        if (!id)
            return;
        tabController.selectTab({ id });
    }, [tabController]);

    const tabElements = tabs.map((tab) => {
        return (
            <div key={tab.id} className={`${styles.tab} ${tab.active ? styles.active : ''}`}
                data-tab-id={tab.id} onClick={onTabClick}>
                <span>
                    {tab.title}
                </span>
            </div>
        );
    });

    const contents = tabs.map((tab) => {
        return composeElements(
            <div key={tab.id} className={`${styles.content} ${tab.active ? styles.active : ''}`} />,
            <HistoryControllerProvider value={tab.historyController} />,
            <EntryView />,
        );
    });

    return (
        <div className={`${styles.view} ${props.className ?? ''}`}>
            <div className={styles.tabs}>
                {tabElements}
                <TabAddButton />
            </div>
            <div className={styles.contents}>{contents}</div>
        </div>
    );
};
