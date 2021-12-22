import React from 'react';

import { useTabController } from '../../contexts/tab-controller-context';
import { PlusSmallIcon } from '../icons';
import styles from './tab-add-button.css';

export const TabAddButton = () => {
    const tabController = useTabController();

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
