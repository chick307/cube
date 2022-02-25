import React from 'react';

import { Entry } from '../../../common/entities/entry';
import { FileSystem } from '../../../common/entities/file-system';
import { EntryPath } from '../../../common/values/entry-path';
import { useService } from '../../hooks/use-service';
import type { LocalEntryService } from '../../services/local-entry-service';
import { ChevronRightSmallIcon, MoreHorizontalIcon } from '../icons';
import { EntryDraggable, EntryDragImage } from './entry-draggable';
import { EntryIcon } from './entry-icon';
import styles from './entry-path-view.module.css';

export type Props = {
    entry: Entry;
    fileSystem: FileSystem;
};

const rootDirectoryPath = new EntryPath('/');

const shrinkIndicator = (
    <span key={0} className={styles.shrinkIndicator}>
        <span className={styles.delimiter}>{ChevronRightSmallIcon}</span>
        <div className={styles.moreIcon}>{MoreHorizontalIcon}</div>
    </span>
);

export const EntryPathView = (props: Props) => {
    const { entry, fileSystem } = props;

    const localEntryService = useService('localEntryService');

    const viewRef = React.useRef<HTMLDivElement>(null);
    const contentRef = React.useRef<HTMLDivElement>(null);

    const paths = React.useMemo(() => {
        const homeDirectory = localEntryService.getHomeDirectoryEntry();
        const list = [] as React.ReactNode[];
        let p: EntryPath | null = entry.path;
        let i = 1;
        while (p !== null) {
            const key = i++;
            if (fileSystem.isLocal()) {
                if (p.equals(rootDirectoryPath)) {
                    list.push(shrinkIndicator, (
                        <EntryDraggable {...{ fileSystem, key }} path={p} type={'directory'}
                            className={`${styles.rootEntryName} ${styles.entryName}`}>
                            <EntryDragImage className={styles.dragImage} offsetX={8} offsetY={8}>
                                <EntryIcon className={styles.rootIcon} entryPath={p} {...{ fileSystem }} />
                            </EntryDragImage>
                        </EntryDraggable>
                    ));
                    break;
                } else if (p.equals(homeDirectory.path)) {
                    list.push(shrinkIndicator, (
                        <EntryDraggable {...{ fileSystem, key }} path={p} type={'directory'}
                            className={`${styles.rootEntryName} ${styles.entryName}`}>
                            <EntryDragImage className={styles.dragImage} offsetX={8} offsetY={8}>
                                <EntryIcon className={styles.rootIcon} entryPath={p} {...{ fileSystem }} />
                            </EntryDragImage>
                        </EntryDraggable>
                    ));
                    break;
                }
            } else if (fileSystem.isZip()) {
                if (p.equals(rootDirectoryPath)) {
                    list.push(shrinkIndicator, (
                        <EntryDraggable {...{ fileSystem, key }} path={p} type={'directory'}
                            className={`${styles.rootEntryName} ${styles.entryName}`}>
                            <EntryDragImage className={styles.dragImage} offsetX={8} offsetY={8}>
                                <EntryIcon className={styles.zipIcon} entryPath={p} {...{ fileSystem }} />
                                <span>{fileSystem.container.entry.name.toString()}</span>
                            </EntryDragImage>
                        </EntryDraggable>
                    ));
                    break;
                }
            }
            const type = p === entry.path ? entry.type : 'directory';
            list.push((
                <span className={styles.entryNameContainer} {...{ key }}>
                    <span className={styles.entryNameContent}>
                        <EntryDraggable {...{ fileSystem, type }} path={p} className={styles.entryName}>
                            <span className={styles.delimiter}>{ChevronRightSmallIcon}</span>
                            <EntryDragImage className={styles.dragImage} offsetX={8} offsetY={8}>
                                <span className={styles.iconContainer}>
                                    <EntryIcon {...{ entryPath: p, fileSystem }} />
                                </span>
                                <span className={styles.entryNameText}>{p.name.toString()}</span>
                            </EntryDragImage>
                        </EntryDraggable>
                    </span>
                </span>
            ));
            p = p.getParentPath();
        }
        return list.reverse();
    }, [entry, fileSystem]);

    const resize = React.useCallback(() => {
        const view = viewRef.current;
        if (view === null)
            return;
        const rootEntryName = view.getElementsByClassName(styles.rootEntryName)[0] as HTMLElement;
        const shrinkIndicator = view.getElementsByClassName(styles.shrinkIndicator)[0] as HTMLElement;
        const entryNames = Array.from(view.getElementsByClassName(styles.entryNameContainer)) as HTMLElement[];
        const maxSize = view.clientWidth;
        let size = entryNames.reduce((size, entryNameContainer) => (
            size + entryNameContainer.getElementsByClassName(styles.entryNameContent)[0].getBoundingClientRect().width
        ), rootEntryName.getBoundingClientRect().width);
        if (size <= maxSize) {
            if (view.dataset.shrinking === 'true')
                view.dataset.shrinking = 'false';
            for (let index = 0; index < entryNames.length; index++) {
                const entryName = entryNames[index];
                if (entryName.dataset.shrunken === 'true')
                    entryName.dataset.shrunken = 'false';
            }
            if (view.dataset.shrinkingLast === 'true')
                view.dataset.shrinkingLast = 'false';
        } else {
            if (entryNames.length <= 1) {
                view.dataset.shrinking = 'false';
            } else if (view.dataset.shrinking !== 'true') {
                view.dataset.shrinking = 'true';
            }
            size += shrinkIndicator.scrollWidth;
            for (let index = 0; index < entryNames.length; index++) {
                const entryName = entryNames[index];
                if (size > maxSize && index !== entryNames.length - 1) {
                    if (entryName.dataset.shrunken !== 'true')
                        entryName.dataset.shrunken = 'true';
                    size -= entryName.getElementsByClassName(styles.entryNameContent)[0].getBoundingClientRect().width;
                } else {
                    if (entryName.dataset.shrunken === 'true')
                        entryName.dataset.shrunken = 'false';
                }
            }
            if (size > maxSize) {
                if (view.dataset.shrinkingLast !== 'true')
                    view.dataset.shrinkingLast = 'true';
            } else if (view.dataset.shrinkingLast === 'true') {
                view.dataset.shrinkingLast = 'false';
            }
        }
    }, []);

    React.useEffect(() => {
        const resizeHandler = () => resize();
        window.addEventListener('resize', resizeHandler, { passive: true });
        return () => window.removeEventListener('resize', resizeHandler);
    }, []);

    React.useEffect(() => {
        setTimeout(resize);
    }, [paths]);

    return (
        <div ref={viewRef} className={styles.entryPathView}>
            <div ref={contentRef} className={styles.content}>
                {paths}
            </div>
        </div>
    );
};

declare module '../../hooks/use-service' {
    interface Services {
        'components/entry/entry-path-view': {
            localEntryService: LocalEntryService;
        };
    }
}
