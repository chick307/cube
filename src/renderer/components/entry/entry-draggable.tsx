import React from 'react';

import { EntryType } from '../../../common/entities/entry';
import { FileSystem } from '../../../common/entities/file-system';
import { EntryPath } from '../../../common/values/entry-path';
import styles from './entry-draggable.module.css';

export type Props = {
    children?: React.ReactNode;
    className?: string | null | undefined;
    fileSystem?: FileSystem | null | undefined;
    path?: EntryPath | null | undefined;
    type?: EntryType | null | undefined;
};

export const EntryDraggable = (props: Props) => {
    const { children, fileSystem = null, path = null, type = null } = props;

    const className = `${styles.entryDraggable} ${props.className ?? ''}`;

    const draggable = path !== null && type !== null;

    const onDragStart = React.useCallback((event: React.DragEvent) => {
        if (path === null || type === null || fileSystem === null) {
            event.preventDefault();
            return;
        }
        event.dataTransfer.effectAllowed = 'move';
        const element = event.currentTarget as HTMLElement;
        const dragImage = element.getElementsByClassName(styles.entryDragImage)[0] as HTMLElement;
        if (dragImage != null) {
            const offsetX = parseInt(dragImage.dataset.offsetX ?? '0', 10);
            const offsetY = parseInt(dragImage.dataset.offsetY ?? '0', 10);
            event.dataTransfer.setDragImage(dragImage, offsetX, offsetY);
        }
        event.dataTransfer.setData('application/x-cube-item+json', JSON.stringify({
            entry: { type, path: path.toString() },
            fileSystem: fileSystem.toJson(),
        }));
    }, [fileSystem, path, type]);

    return (
        <div {...{ className, draggable, onDragStart }}>
            {children}
        </div>
    );
};

export type EntryDragImageProps = {
    children?: React.ReactNode;
    className?: string | null | undefined;
    offsetX?: number | null | undefined;
    offsetY?: number | null | undefined;
};

export const EntryDragImage = (props: EntryDragImageProps) => {
    const { children, offsetX, offsetY } = props;

    const className = `${styles.entryDragImage} ${props.className ?? ''}`;

    return (
        <div {...{ className }} data-offset-x={offsetX ?? 0} data-offset-y={offsetY ?? 0}>
            {children}
        </div>
    );
};
