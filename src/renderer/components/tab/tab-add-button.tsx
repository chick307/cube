import React from 'react';

import type { TabController } from '../../controllers/tab-controller';
import { useService } from '../../hooks/use-service';
import { PlusSmallIcon } from '../icons';
import styles from './tab-add-button.css';

export const TabAddButton = () => {
    const tabController = useService('tabController');

    const className = `${styles.tabAddButton}`;

    const onClick = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        tabController.addTab({ active: true });
        event.currentTarget.blur();
    }, [tabController]);

    return (
        <button {...{ className, onClick }}>
            {PlusSmallIcon}
        </button>
    );
};

declare module '../../hooks/use-service' {
    interface Services {
        'components/tab/tab-add-button': {
            tabController: TabController;
        };
    }
}
