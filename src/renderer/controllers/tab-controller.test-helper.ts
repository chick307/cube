import { EventController } from '../../common/utils/event-controller';
import { Restate } from '../../common/utils/restate';
import type {
    ActiveTabChangedEvent,
    HistoryStateChangedEvent,
    TabAllClosedEvent,
    TabController,
    TabControllerState,
} from './tab-controller';

export const createTabController = (params?: {
    state?: TabControllerState | null;
}) => {
    const state = params?.state ?? { tabs: [] };

    const onActiveTabChangedController = new EventController<ActiveTabChangedEvent>();
    const onHistoryStateChangedController = new EventController<HistoryStateChangedEvent>();
    const onTabAllClosedController = new EventController<TabAllClosedEvent>();
    const restate = new Restate(state);

    return {
        onActiveTabChangedController,
        restate,
        tabController: {
            state: restate.state,
            onActiveTabChanged: onActiveTabChangedController.signal,
            onHistoryStateChanged: onHistoryStateChangedController.signal,
            onTabAllClosed: onTabAllClosedController.signal,
            addTab: () => {},
            insertTabs: () => {},
            removeTab: () => {},
            selectNextTab: () => {},
            selectTab: () => {},
            selectPreviousTab: () => {},
        } as TabController,
    };
};
