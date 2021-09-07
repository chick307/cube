import { useTabController } from '../../contexts/tab-controller-context';
import { useContextMenu } from '../../hooks/use-context-menu';

export type Props = {
    children?: React.ReactNode;
    tabId: number;
};

export const TabContextMenu = (props: Props) => {
    const { children, tabId } = props;

    const tabController = useTabController();

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
