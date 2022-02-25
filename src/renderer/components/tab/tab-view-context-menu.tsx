import type { TabController } from '../../controllers/tab-controller';
import { useContextMenu } from '../../hooks/use-context-menu';
import { useService } from '../../hooks/use-service';

export type Props = {
    children?: React.ReactNode;
};

export const TabViewContextMenu = (props: Props) => {
    const { children } = props;

    const tabController = useService('tabController');

    const ContextMenu = useContextMenu(() => {
        return [
            {
                id: 'new-tab',
                label: 'New Tab',
                onClicked: () => {
                    tabController.addTab({ active: true });
                },
            },
        ];
    }, [tabController]);

    return (
        <ContextMenu>
            {children}
        </ContextMenu>
    );
};

declare module '../../hooks/use-service' {
    interface Services {
        'components/tab/tab-view-context-menu': {
            tabController: TabController;
        };
    }
}
