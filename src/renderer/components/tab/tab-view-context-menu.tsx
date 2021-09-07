import { useTabController } from '../../contexts/tab-controller-context';
import { useContextMenu } from '../../hooks/use-context-menu';

export type Props = {
    children?: React.ReactNode;
};

export const TabViewContextMenu = (props: Props) => {
    const { children } = props;

    const tabController = useTabController();

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
