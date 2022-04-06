import React from 'react';

import { BinaryViewerControllerBlockState } from '../../../viewer-controllers/binary-viewer-controller';
import { BinaryCharacter } from './binary-character';
import styles from './binary-block.module.css';

export type Props = {
    addressTextWidth: number;

    block: BinaryViewerControllerBlockState;

    buffer: Buffer;

    className?: string | undefined;

    columnCount: number;

    visible: boolean;
};

export const BinaryBlock = (props: Props) => {
    const {
        addressTextWidth,
        block,
        buffer,
        className: classNameProp,
        columnCount,
        visible,
    } = props;

    const { blockEnd, blockStart, codePoints, id } = block;

    const className = classNameProp == null ? styles.binaryBlock : `${styles.binaryBlock} ${classNameProp}`;

    const rowLength = Math.ceil((blockEnd - blockStart) / 16 / columnCount);

    const style = React.useMemo(() => {
        return {
            '--column-count': `${columnCount}`,
            '--row-count': `${rowLength}`,
        } as React.CSSProperties;
    }, [columnCount, rowLength]);

    const rowElements = React.useMemo<React.ReactNode[] | null>(() => {
        if (!visible)
            return null;

        const rowElements: React.ReactNode[] = [];
        for (let row = 0; row < rowLength; row++) {
            const rowStart = row * 16 * columnCount;
            const rowEnd = Math.min(rowStart + 16 * columnCount, blockEnd - blockStart);
            const rowAddress = rowStart + blockStart;
            const addressText = rowAddress.toString(16).toUpperCase().padStart(addressTextWidth, '0');
            const byteElements: React.ReactNode[] = [];
            const characterElements: React.ReactNode[] = [];
            for (let index = rowStart; index < rowEnd; index++) {
                const value = buffer[blockStart + index];
                const byteText = value.toString(16).toUpperCase().padStart(2, '0');
                byteElements.push(<div key={index} className={styles.byte}>{byteText}</div>);
                const codePoint = codePoints[index];
                characterElements
                    .push(<BinaryCharacter key={index} className={styles.character} {...{ codePoint }} />);
            }
            let n = (16 - rowEnd % 16) % 16;
            while (n-- > 0)
                byteElements.push(<div key={-n - 1} className={styles.byte}></div>);
            rowElements.push(
                <div key={row} className={styles.row}>
                    <div className={styles.address}>{addressText}</div>
                    {byteElements}
                    {characterElements}
                </div>,
            );
        }
        return rowElements;
    }, [addressTextWidth, block, columnCount, visible]);

    return (
        <div key={id} {...{ className, style }} data-block-id={id}>
            {rowElements}
        </div>
    );
};
