import { HistoryItem, HistoryItemJson } from '../../common/entities/history-item';
import { TabController } from '../controllers/tab-controller';
import { MainChannelService } from './main-channel-service';

export type ApplicationService = {
    initialize(): void;
};

export class ApplicationServiceImpl implements ApplicationService {
    #mainChannelService: MainChannelService;

    #tabController: TabController;

    constructor(params: {
        mainChannelService: MainChannelService;
        tabController: TabController;
    }) {
        this.#mainChannelService = params.mainChannelService;
        this.#tabController = params.tabController;
    }

    initialize(): void {
        const onStateChanged = (event: { tabId: number; }) => {
            const tab = this.#tabController.state.current.tabs.find((tab) => tab.id === event.tabId);
            if (tab == null || !tab.active)
                return;
            const { ableToGoBack, ableToGoForward } = tab.historyController.state.current;
            this.#mainChannelService.postMessage({ type: 'history.state-changed', ableToGoBack, ableToGoForward });
        };

        this.#tabController.onActiveTabChanged.addListener(onStateChanged);
        this.#tabController.onHistoryStateChanged.addListener(onStateChanged);

        this.#tabController.onTabAllClosed.addListener(() => {
            window.close();
        });

        this.#mainChannelService.onMessage.addListener((message) => {
            switch (message.type) {
                case 'history.go-back': {
                    const tab = this.#tabController.state.current.tabs.find((tab) => tab.active);
                    if (tab == null)
                        return;
                    tab.historyController.goBack();
                    return;
                }

                case 'history.go-forward': {
                    const tab = this.#tabController.state.current.tabs.find((tab) => tab.active);
                    if (tab == null)
                        return;
                    tab.historyController.goForward();
                    return;
                }

                case 'window.add-tab': {
                    this.#tabController.addTab({ active: true });
                    return;
                }

                case 'window.close-tab': {
                    const tab = this.#tabController.state.current.tabs.find((tab) => tab.active);
                    if (tab == null)
                        return;
                    this.#tabController.removeTab({ id: tab.id });
                    return;
                }

                case 'window.initialize': {
                    const historyItem = HistoryItem.fromJson(message.historyItem);
                    this.#tabController.addTab({ active: true, historyItem });
                    this.#mainChannelService.postMessage({ type: 'window.ready-to-show' });
                    return;
                }

                case 'window.open-file': {
                    const historyItem = HistoryItem.fromJson(message.historyItem);
                    this.#tabController.addTab({ active: true, historyItem });
                    return;
                }

                case 'window.select-next-tab': {
                    this.#tabController.selectNextTab();
                    return;
                }

                case 'window.select-previous-tab': {
                    this.#tabController.selectPreviousTab();
                    return;
                }
            }
        });
    }
}

declare module './main-channel-service' {
    interface MainChannelIncomingMessages {
        'history.go-back': {
            type: 'history.go-back';
        };

        'history.go-forward': {
            type: 'history.go-forward';
        };

        'window.add-tab': {
            type: 'window.add-tab';
        };

        'window.close-tab': {
            type: 'window.close-tab';
        };

        'window.initialize': {
            type: 'window.initialize';
            historyItem: HistoryItemJson;
        };

        'window.open-file': {
            type: 'window.open-file';
            historyItem: HistoryItem;
        };

        'window.select-next-tab': {
            type: 'window.select-next-tab';
        };

        'window.select-previous-tab': {
            type: 'window.select-previous-tab';
        };
    }

    interface MainChannelOutgoingMessages {
        'history.state-changed': {
            type: 'history.state-changed';
            ableToGoBack: boolean;
            ableToGoForward: boolean;
        };

        'window.ready-to-show': {
            type: 'window.ready-to-show';
        };
    }
}
