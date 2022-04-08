import React from 'react';

import { TabController } from '../../controllers/tab-controller';
import { useService } from '../../hooks/use-service';
import { XSmallIcon } from '../icons';
import styles from './tab-close-button.module.css';

export type Props = {
    className?: string;
    tabId: number;
};

export const TabCloseButton = (props: Props) => {
    const tabController = useService('tabController');

    const { tabId } = props;

    const className = `${styles.tabCloseButton} ${props.className ?? ''}`;

    const onClick = React.useCallback(() => {
        tabController.removeTab({ id: tabId });
    }, [tabController, tabId]);

    return (
        <button {...{ className, onClick }}>
            {XSmallIcon}
        </button>
    );
};

declare module '../../hooks/use-service' {
    interface Services {
        'components/tab/tab-close-button': {
            tabController: TabController;
        };
    }
}
