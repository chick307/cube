import React from 'react';

import { Entry } from '../../common/entities';
import { DirectoryEntry } from '../../common/entities/directory-entry';
import { ZipFileSystem } from '../../common/entities/zip-file-system';
import { EntryPath } from '../../common/values/entry-path';
import { useHistoryController } from '../contexts/history-controller-context';
import { useStatusBar, useStatusBarGateway } from '../gateways/status-bar-gateway';
import { useRestate } from '../hooks/use-restate';
import styles from './entry-view.css';
import { entryViews } from './entry-views';
import { GoBackButton } from './go-back-button';
import { GoForwardButton } from './go-forward-button';

export type Props = {
    className?: string;
};

const isZipEntry = (entry: Entry) => entry.isFile() && /^\.(?:zip)$/.test(entry.path.getExtension());

export const EntryView = (props: Props) => {
    const { className = '' } = props;

    const historyController = useHistoryController();

    const { current: { entry, fileSystem } } = useRestate(historyController.state);

    const { entryView, view } = React.useMemo(() => {
        if (isZipEntry(entry))
            return null;
        const entryView = entryViews.find((entryView) => entryView.test(entry));
        if (entryView == null)
            return null;
        const view = entryView.render({ entry, fileSystem });
        return { entryView, view };
    }, [entry, fileSystem]) ?? {
        entryView: null,
        view: null,
    };

    React.useEffect(() => {
        if (entry.isFile() && isZipEntry(entry)) {
            historyController.replace({
                entry: new DirectoryEntry(new EntryPath('/')),
                fileSystem: new ZipFileSystem({
                    container: { entry, fileSystem },
                }),
            });
        }
    }, [entry, fileSystem]);

    const { StatusBarExit, StatusBarProvider } = useStatusBar();

    const StatusBarGateway = useStatusBarGateway();

    return (
        <div className={`${className} ${styles.entryView}`}>
            <div className={styles.path}>
                <GoBackButton className={styles.goBackButton} />
                <GoForwardButton className={styles.goForwardButton} />
                <span className={styles.pathString}>{entry.path.toString()}</span>
            </div>
            <div className={styles.viewContainer}>
                <StatusBarProvider>
                    {view}
                </StatusBarProvider>
            </div>
            <StatusBarGateway>
                <div className={styles.entryViewStatusBar}>
                    <StatusBarExit />
                </div>
                <div className={styles.entryViewNameContainer}>
                    <span className={styles.entryViewName}>
                        {entryView?.name ?? ''}
                    </span>
                </div>
            </StatusBarGateway>
        </div>
    );
};
