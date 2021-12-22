import React from 'react';
import { useTabController } from '../../contexts/tab-controller-context';
import { XSmallIcon } from '../icons';
import styles from './tab-close-button.css';

export type Props = {
    className?: string;
    tabId: number;
};

export const TabCloseButton = (props: Props) => {
    const tabController = useTabController();

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
