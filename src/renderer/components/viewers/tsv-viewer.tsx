import React from 'react';

import type { Entry } from '../../../common/entities/entry';
import type { FileSystem } from '../../../common/entities/file-system';
import type { TsvViewerState } from '../../../common/values/viewer-state';
import type { TsvViewerControllerFactory } from '../../factories/viewer-controller-factory';
import { useRestate } from '../../hooks/use-restate';
import { useService } from '../../hooks/use-service';
import styles from './tsv-viewer.module.css';

export type Props = {
    className?: string;

    entry: Entry;

    fileSystem: FileSystem;

    viewerState: TsvViewerState;
};

export const TsvViewer = (props: Props) => {
    const {
        className: classNameProp,
        entry,
        fileSystem,
        viewerState,
    } = props;

    const viewerControllerFactory = useService('viewerControllerFactory');

    const viewerController = React.useMemo(() => {
        return viewerControllerFactory.createTsvViewerController();
    }, [viewerControllerFactory]);

    viewerController.initialize({ entry, fileSystem, viewerState });

    const {
        header,
        rows,
    } = useRestate(viewerController.state);

    const className = classNameProp == null ? styles.tsvViewer : `${styles.tsvViewer} ${classNameProp}`;

    const headerElement = React.useMemo(() => {
        const cellElements = header.cells.map((cell) => {
            return (
                <th key={cell.id}>
                    {cell.value}
                </th>
            );
        });
        return (
            <tr>
                <th></th>
                {cellElements}
            </tr>
        );
    }, [header]);

    const rowElements = React.useMemo(() => {
        const rowElements = rows.map((row) => {
            const cellElements = row.cells.map((cell) => {
                return (
                    <td key={cell.id}>
                        {cell.value}
                    </td>
                );
            });
            return (
                <tr key={row.id}>
                    <td className={styles.rowNumber}></td>
                    {cellElements}
                </tr>
            );
        });
        return rowElements;
    }, [rows]);

    return (
        <div {...{ className }}>
            <table className={styles.tsvTable}>
                <thead>
                    {headerElement}
                </thead>
                <tbody>
                    {rowElements}
                </tbody>
            </table>
        </div>
    );
};

declare module '../../hooks/use-service' {
    interface Services {
        'components/viewers/tsv-viewer': {
            viewerControllerFactory: TsvViewerControllerFactory;
        };
    }
}
