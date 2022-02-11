import React from 'react';

import type { HistoryItem } from '../../../common/entities/history-item';
import { HistoryControllerProvider } from '../../contexts/history-controller-context';
import { KeyboardServiceProvider } from '../../contexts/keyboard-service-context';
import type { TabController } from '../../controllers/tab-controller';
import { useRestate } from '../../hooks/use-restate';
import { ServiceProvider, ServicesProvider, useService } from '../../hooks/use-service';
import type { KeyboardService } from '../../services/keyboard-service';
import { composeElements } from '../../utils/compose-elements';
import { EntryDropArea } from '../entry/entry-drop-area';
import { EntryView } from '../entry/entry-view';
import { Tab } from './tab';
import tabStyles from './tab.module.css';
import { TabAddButton } from './tab-add-button';
import styles from './tab-view.module.css';
import { TabViewContextMenu } from './tab-view-context-menu';
import { TabViewDragOverIndicator } from './tab-view-drag-over-indicator';

export type Props = {
    className?: string;
};

export const TabView = (props: Props) => {
    const keyboardService = useService('keyboardService');
    const tabController = useService('tabController');

    const { tabs } = useRestate(tabController.state);

    const tabElements = React.useMemo(() => tabs.map((tab) => {
        return <Tab key={tab.id} {...{ tab }} />;
    }), [tabs]);

    const contents = React.useMemo(() => tabs.map((tab) => {
        return composeElements(
            <div key={tab.id} className={`${styles.content} ${tab.active ? styles.active : ''}`} />,
            <ServicesProvider value={tab.services} />,
            <ServiceProvider name={'keyboardService'} value={tab.active ? keyboardService : null} />,
            <HistoryControllerProvider value={tab.historyController} />,
            <KeyboardServiceProvider value={tab.active ? keyboardService : null}/>,
            <EntryView />,
        );
    }), [tabs]);

    const onEntryDropInAppendArea = React.useCallback((historyItems: HistoryItem[]) => {
        tabController.insertTabs({ active: true, historyItems, index: Infinity });
    }, [tabController]);

    const onEntryDropInPrependArea = React.useCallback((historyItems: HistoryItem[]) => {
        tabController.insertTabs({ active: true, historyItems, index: 0 });
    }, [tabController]);

    return (
        <div className={`${styles.view} ${props.className ?? ''}`}>
            <TabViewContextMenu>
                <EntryDropArea dragOverClassName={`${styles.tabViewDragOver} ${tabStyles.tabViewDragOver}`}>
                    <div className={styles.tabs}>
                        <EntryDropArea dragOverClassName={styles.prependAreaDragOver}
                            onEntryDrop={onEntryDropInPrependArea}>
                            <div className={styles.prependArea}>
                                <TabViewDragOverIndicator className={styles.tabViewDragOverIndicator} />
                            </div>
                        </EntryDropArea>
                        {tabElements}
                        <EntryDropArea dragOverClassName={styles.appendAreaDragOver}
                            onEntryDrop={onEntryDropInAppendArea}>
                            <div className={styles.appendArea}>
                                <TabViewDragOverIndicator className={styles.tabViewDragOverIndicator} />
                                <TabAddButton />
                            </div>
                        </EntryDropArea>
                    </div>
                </EntryDropArea>
            </TabViewContextMenu>
            <div className={styles.contents}>{contents}</div>
        </div>
    );
};

declare module '../../hooks/use-service' {
    interface Services {
        'components/tab/tab-view': {
            keyboardService: KeyboardService | null;

            tabController: TabController;
        };
    }
}
