import React from 'react';

import { LocalFileSystem } from '../../../common/entities/file-system';
import { HistoryItem } from '../../../common/entities/history-item';
import { EntryPath } from '../../../common/values/entry-path';
import { useLocalEntryService } from '../../contexts/local-entry-service-context';
import styles from './entry-drop-area.module.css';

export type Props = {
    children?: React.ReactNode;

    dragOverClassName?: string;

    onEntryDrop?: (historyItems: HistoryItem[]) => void;
};

const localFileSystem = new LocalFileSystem();

export const EntryDropArea = (props: Props) => {
    const { children, dragOverClassName, onEntryDrop } = props;

    const localEntryService = useLocalEntryService();

    const dragOverRef = React.useRef(false);

    const enteringRef = React.useRef(false);

    const [dragOver, setDragging] = React.useState(false);

    const onDragEnter = React.useCallback(() => {
        if (!dragOverRef.current || enteringRef.current)
            return;
        enteringRef.current = true;
        setTimeout(() => {
            enteringRef.current = false;
        });
    }, []);

    const onDragLeave = React.useCallback(() => {
        if (!dragOverRef.current || enteringRef.current)
            return;
        dragOverRef.current = false;
        setDragging(false);
    }, []);

    const onDragOver = React.useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
        if (!dragOverRef.current) {
            dragOverRef.current = true;
            setDragging(true);
        }
    }, []);

    const onDrop = React.useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
        const files = Array.from(event.dataTransfer.files);
        if (onEntryDrop == null)
            return;
        (async () => {
            const historyItems = await Promise.all(files.map(async (file) => {
                const entryPath = new EntryPath(file.path);
                const entry = await localEntryService.createEntryFromPath({ entryPath });
                if (entry == null)
                    return null;
                return new HistoryItem({ entry, fileSystem: localFileSystem });
            })).then((items) => items.filter((item): item is HistoryItem => item !== null));
            if (historyItems.length === 0)
                return;
            onEntryDrop(historyItems);
        })();
    }, [localEntryService, onEntryDrop]);

    const onDropCapture = React.useCallback(() => {
        dragOverRef.current = false;
        setDragging(false);
    }, [localEntryService, onEntryDrop]);

    const className = [
        styles.entryDropArea,
        dragOver ? dragOverClassName ?? '' : '',
    ].join(' ');

    return (
        <div {...{ className, onDragEnter, onDragLeave, onDragOver, onDrop, onDropCapture }}>
            {children}
        </div>
    );
};
