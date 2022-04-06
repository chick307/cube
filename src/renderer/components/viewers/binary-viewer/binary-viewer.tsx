import React from 'react';

import type { Entry } from '../../../../common/entities/entry';
import type { FileSystem } from '../../../../common/entities/file-system';
import { Point } from '../../../../common/values/point';
import type { BinaryViewerState } from '../../../../common/values/viewer-state';
import type { HistoryController } from '../../../controllers/history-controller';
import type { BinaryViewerControllerFactory } from '../../../factories/viewer-controller-factory';
import { useRestate } from '../../../hooks/use-restate';
import { useService } from '../../../hooks/use-service';
import { BinaryViewerControllerBlockState } from '../../../viewer-controllers/binary-viewer-controller';
import { BinaryBlock } from './binary-block';
import { BinaryHeader } from './binary-header';
import styles from './binary-viewer.module.css';

export type Props = {
    className?: string;

    entry: Entry;

    fileSystem: FileSystem;

    viewerState: BinaryViewerState;
};

export const BinaryViewer = (props: Props) => {
    const {
        className: classNameProp,
        entry,
        fileSystem,
        viewerState,
    } = props;

    const historyController = useService('historyController');
    const viewerControllerFactory = useService('viewerControllerFactory');

    const viewerController = React.useMemo(() => {
        return viewerControllerFactory.createBinaryViewerController({ historyController });
    }, [viewerControllerFactory, historyController]);

    viewerController.initialize({ entry, fileSystem, viewerState });

    const {
        blocks,
        buffer,
        scrollPosition,
    } = useRestate(viewerController.state);

    const viewerElementRef = React.useRef<HTMLDivElement>(null);

    const binaryContentsForMeasuringRef = React.useRef<HTMLDivElement>(null);

    const binaryContentsRef = React.useRef<HTMLDivElement>(null);

    const className = classNameProp == null ? styles.binaryViewer : `${styles.binaryViewer} ${classNameProp}`;

    const [columnCount, setColumnCount] = React.useState(1);

    const { bufferForMeasuring, blockForMeasuring } = React.useMemo(() => {
        const bufferForMeasuring = Buffer.alloc(16 * (columnCount + 1));
        const blockForMeasuring: BinaryViewerControllerBlockState = {
            blockEnd: bufferForMeasuring.length,
            blockStart: 0,
            codePoints: new Array(bufferForMeasuring.length).fill(null),
            id: 'measuring',
        };
        return { bufferForMeasuring, blockForMeasuring };
    }, [columnCount]);

    React.useEffect(() => {
        const viewerElement = viewerElementRef.current as HTMLDivElement;
        const viewerContainer = viewerElement.offsetParent as HTMLElement;
        const elementForMeasuringPadding = viewerElement.getElementsByClassName(styles.elementForMeasuringPadding)[0];
        const binaryContentsForMeasuring = binaryContentsForMeasuringRef.current as HTMLDivElement;
        const binaryContents = binaryContentsRef.current as HTMLDivElement;
        const resizeObserver = new ResizeObserver(() => {
            const paddingSize = elementForMeasuringPadding.getBoundingClientRect().width;
            const containerWidth = viewerContainer.getBoundingClientRect().width;
            const wideContentsWidth = binaryContentsForMeasuring.getBoundingClientRect().width + paddingSize;
            const contentsWidth = binaryContents.getBoundingClientRect().width + paddingSize;
            if (wideContentsWidth <= containerWidth) {
                setColumnCount((columnCount) => columnCount + 1);
            } else if (containerWidth < contentsWidth) {
                setColumnCount((columnCount) => columnCount === 1 ? 1 : columnCount - 1);
            }
        });
        resizeObserver.observe(viewerContainer);
        resizeObserver.observe(elementForMeasuringPadding);
        resizeObserver.observe(binaryContentsForMeasuring);
        resizeObserver.observe(binaryContents);
        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    const lastBlock = blocks == null ? null : blocks[blocks.length - 1] ?? null;
    const addressTextWidth = lastBlock === null ? 1 : (lastBlock.blockEnd - 1).toString(16).length;

    const [visibleBlockIds, setVisibleBlockIds] = React.useState(new Set<string>());

    React.useEffect(() => {
        const binaryContents = binaryContentsRef.current as HTMLDivElement;
        const intersectionObserver = new IntersectionObserver((entries) => {
            setVisibleBlockIds((blockIds) => {
                const newBlockIds = new Set(blockIds);
                for (const entry of entries) {
                    const target = entry.target as HTMLElement;
                    const blockId = target.dataset.blockId as string;
                    if (entry.isIntersecting) {
                        newBlockIds.add(blockId);
                    } else {
                        newBlockIds.delete(blockId);
                    }
                }
                return newBlockIds;
            });
        });
        for (const block of Array.from(binaryContents.getElementsByClassName(styles.block)))
            intersectionObserver.observe(block);
        return () => {
            intersectionObserver.disconnect();
        };
    }, [blocks, columnCount]);

    const blockElements = React.useMemo<React.ReactNode[] | null>(() => {
        if (blocks === null)
            return null;

        const blockBuffer = buffer as Buffer;
        return blocks.map((block) => {
            const { id } = block;
            const visible = visibleBlockIds.has(id);
            return (
                <BinaryBlock key={id} className={styles.block} buffer={blockBuffer}
                    {...{ addressTextWidth, block, columnCount, visible }} />
            );
        });
    }, [addressTextWidth, blocks, columnCount, visibleBlockIds]);

    // save scroll position
    React.useEffect(() => {
        const viewerElement = viewerElementRef.current as HTMLDivElement;
        const container = viewerElement?.offsetParent as HTMLElement | null | undefined;
        if (container == null)
            return;

        let saving: ReturnType<typeof setTimeout> | null = null;

        const handleScroll = () => {
            if (saving !== null)
                clearTimeout(saving);
            saving = setTimeout(() => {
                const position = new Point(container.scrollLeft, container.scrollTop);
                viewerController.scrollTo({ position });
            }, 100);
        };

        container.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            container.removeEventListener('scroll', handleScroll);
            if (saving != null)
                clearTimeout(saving);
        };
    }, [viewerController]);

    // restore scroll position
    React.useEffect(() => {
        // return if not rendered yet
        if (blocks === null)
            return;

        const viewerElement = viewerElementRef.current as HTMLDivElement;
        const container = viewerElement?.offsetParent as HTMLElement | null | undefined;
        if (container == null)
            return;
        container.scrollTo(scrollPosition.x, scrollPosition.y);
    }, [blocks]);

    return (
        <div ref={viewerElementRef} {...{ className }}>
            <div className={styles.containerForMeasuring}>
                <div ref={binaryContentsForMeasuringRef} className={styles.binaryContents}>
                    <div className={styles.elementForMeasuringPadding}></div>
                    <BinaryBlock block={blockForMeasuring} buffer={bufferForMeasuring} columnCount={columnCount + 1}
                        visible={true} {...{ addressTextWidth }} />
                </div>
            </div>
            <div ref={binaryContentsRef} className={styles.binaryContents}>
                <BinaryHeader {...{ addressTextWidth, columnCount }} />
                {blockElements}
            </div>
        </div>
    );
};

declare module '../../../hooks/use-service' {
    interface Services {
        'components/viewers/binary-viewer/binary-viewer': {
            historyController: HistoryController;

            viewerControllerFactory: BinaryViewerControllerFactory;
        };
    }
}
