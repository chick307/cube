import React from 'react';

import { useTabController } from '../contexts/tab-controller-context';
import styles from './tab-add-button.css';

export const TabAddButton = () => {
    const tabController = useTabController();

    const onClick = React.useCallback(() => {
        tabController.addTab({ active: true });
    }, [tabController]);

    const className = `${styles.tabAddButton}`;

    return (
        <button {...{ className, onClick }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="#FFFFFF">
                <polygon fillRule="evenodd" points="9 7 14 7 14 9 9 9 9 14 7 14 7 9 2 9 2 7 7 7 7 2 9 2"/>
            </svg>
        </button>
    );
};
