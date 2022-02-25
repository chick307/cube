import type { TabController } from '../../controllers/tab-controller';
import { useContextMenu } from '../../hooks/use-context-menu';
import { useService } from '../../hooks/use-service';

export type Props = {
    children?: React.ReactNode;
    tabId: number;
};

export const TabContextMenu = (props: Props) => {
    const { children, tabId } = props;

    const tabController = useService('tabController');

    const ContextMenu = useContextMenu(() => {
        return [
            {
                id: 'close',
                label: 'Close',
                onClicked: () => {
                    tabController.removeTab({ id: tabId });
                },
            },
            { type: 'separator' },
            {
                id: 'new-tab',
                label: 'New Tab',
                onClicked: () => {
                    tabController.addTab({ active: true });
                },
            },
        ];
    }, [tabController, tabId]);

    return (
        <ContextMenu>
            {children}
        </ContextMenu>
    );
};

declare module '../../hooks/use-service' {
    interface Services {
        'components/tab/tab-context-menu': {
            tabController: TabController;
        };
    }
}
