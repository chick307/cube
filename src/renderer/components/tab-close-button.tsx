import React from 'react';
import { useTabController } from '../contexts/tab-controller-context';
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
            <svg width="10" height="10" viewBox="0 0 16 16">
                <polygon fillRule="evenodd" points={
                    '8 9.414 3.707 13.707 2.293 12.293 6.586 8 2.293 3.707 3.707 2.293 8 6.586 ' +
                    '12.293 2.293 13.707 3.707 9.414 8 13.707 12.293 12.293 13.707 8 9.414'
                } />
            </svg>
        </button>
    );
};
