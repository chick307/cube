import React from 'react';

import styles from './binary-header.module.css';

export type Props = {
    addressTextWidth: number;

    columnCount: number;
};

export const BinaryHeader = (props: Props) => {
    const {
        addressTextWidth,
        columnCount,
    } = props;

    const addressText = '0'.repeat(addressTextWidth);

    const columnElements = React.useMemo<React.ReactNode[]>(() => {
        const columnElements: React.ReactNode[] = [];
        const columnTextWidth = Math.max(2, (columnCount * 16 - 1).toString(16).length);
        for (let column = 0; column < columnCount * 16; column++) {
            const columnText = column.toString(16).toUpperCase().padStart(columnTextWidth, '0');
            columnElements.push(<div key={column} className={styles.headerColumn}>{columnText}</div>);
        }
        return columnElements;
    }, [columnCount]);

    return (
        <div className={styles.binaryHeader}>
            <div className={styles.headerAddress}>{addressText}</div>
            {columnElements}
        </div>
    );
};
