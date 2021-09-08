import dompurify from 'dompurify';
import { shell } from 'electron';
import marked from 'marked';
import React from 'react';
import ReactDomServer from 'react-dom/server';

import type { FileEntry } from '../../../common/entities/entry';
import type { FileSystem } from '../../../common/entities/file-system';
import { HistoryItem } from '../../../common/entities/history-item';
import { EntryPath } from '../../../common/values/entry-path';
import { useEntryService } from '../../contexts/entry-service-context';
import { useHistoryController } from '../../contexts/history-controller-context';
import { useEntryText } from '../../hooks/use-entry-text';
import { Highlight } from '../highlight';
import styles from './markdown-entry-view.css';

export type Props = {
    className?: string;
    entry: FileEntry;
    fileSystem: FileSystem;
};

export const MarkdownEntryView = (props: Props) => {
    const { className = '', entry, fileSystem } = props;

    const entryService = useEntryService();
    const historyController = useHistoryController();

    const baseUrl = `file://${entry.path.toString()}`;

    const markdown = useEntryText({ entry, fileSystem });

    const markup = React.useMemo(() => {
        if (markdown === null)
            return null;
        const unsafeHtml = marked(markdown, {
            headerIds: false,
            highlight: (code, lang) => {
                const component = <Highlight language={lang} {...{ code }} />;
                const html = ReactDomServer.renderToString(component);
                return html;
            },
        });
        const safeHtml = dompurify.sanitize(unsafeHtml, {
            /* eslint-disable @typescript-eslint/naming-convention */
            ALLOW_UNKNOWN_PROTOCOLS: true,
            /* eslint-enable @typescript-eslint/naming-convention */
        });
        // eslint-disable-next-line @typescript-eslint/naming-convention
        return { __html: safeHtml };
    }, [markdown]);

    const onDragStart = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
    }, []);

    const onClick = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
        const link = (event.target as HTMLElement).closest('a');
        if (link === null)
            return;
        event.preventDefault();
        const href = link.getAttribute('href');
        if (href === null)
            return;
        const url = new URL(href, baseUrl);
        if (url.protocol === 'file:') {
            const entryPath = new EntryPath(decodeURI(url.pathname));
            Promise.resolve().then(async () => {
                const entry = await entryService.createEntryFromPath({ entryPath, fileSystem });
                if (entry === null)
                    return;
                historyController.navigate(new HistoryItem({ entry, fileSystem }));
            });
        } else {
            shell.openExternal(url.href);
        }
    }, [baseUrl, entryService, historyController, fileSystem]);

    return (
        <div className={`${className} ${styles.view}`}
            onClick={onClick} onAuxClick={onClick} onDragStart={onDragStart}>
            {markup === null ? null : <div className={styles.innerView} dangerouslySetInnerHTML={markup} />}
        </div>
    );
};
