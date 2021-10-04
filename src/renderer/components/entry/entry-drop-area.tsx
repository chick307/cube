import React from 'react';

import { Entry } from '../../../common/entities/entry';
import { FileSystem } from '../../../common/entities/file-system';
import { HistoryItem } from '../../../common/entities/history-item';
import { EntryPath } from '../../../common/values/entry-path';
import { useLocalEntryService } from '../../contexts/local-entry-service-context';
import styles from './entry-drop-area.module.css';

export type Props = {
    children?: React.ReactNode;

    dragOverClassName?: string;

    onEntryDrop?: (historyItems: HistoryItem[]) => void;
};

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
        if (onEntryDrop == null)
            return;
        const files = Array.from(event.dataTransfer.files, (file) => ({
            entry: { path: file.path },
            fileSystem: { type: 'local' },
        }));
        if (event.dataTransfer.types.includes('application/x-cube-item+json'))
            files.push(JSON.parse(event.dataTransfer.getData('application/x-cube-item+json')));
        (async () => {
            const historyItems = await Promise.all(files.map(async (json) => {
                const entry = 'type' in json.entry ?
                    Entry.fromJson(json.entry) :
                    await localEntryService.createEntryFromPath({ entryPath: new EntryPath(json.entry.path) });
                const fileSystem = FileSystem.fromJson(json.fileSystem);
                if (entry == null)
                    return null;
                return new HistoryItem({ entry, fileSystem });
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
