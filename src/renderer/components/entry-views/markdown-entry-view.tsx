import dompurify from 'dompurify';
import { shell } from 'electron';
import { JSDOM } from 'jsdom';
import marked from 'marked';
import React from 'react';
import ReactDomServer from 'react-dom/server';

import type { FileEntry } from '../../../common/entities/entry';
import type { FileSystem } from '../../../common/entities/file-system';
import { HistoryItem } from '../../../common/entities/history-item';
import { EntryPath } from '../../../common/values/entry-path';
import type { HistoryController } from '../../controllers/history-controller';
import { useEntryText } from '../../hooks/use-entry-text';
import { useService } from '../../hooks/use-service';
import { useTask } from '../../hooks/use-task';
import type { EntryService } from '../../services/entry-service';
import { Highlight } from '../highlight';
import styles from './markdown-entry-view.css';

export type Props = {
    className?: string;
    entry: FileEntry;
    fileSystem: FileSystem;
};

export const MarkdownEntryView = (props: Props) => {
    const { className = '', entry, fileSystem } = props;

    const entryService = useService('entryService');
    const historyController = useService('historyController');

    const baseUrl = `file://${entry.path.toString()}`;

    const markdown = useEntryText({ entry, fileSystem });

    const [markup = null] = useTask(async (signal) => {
        if (markdown === null)
            return null;
        const unsafeHtml = marked(markdown, {
            baseUrl,
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
        const doc = new JSDOM(safeHtml).window.document;
        for (const image of Array.from(doc.getElementsByTagName('img'))) {
            const src = image.getAttribute('src');
            if (src === null)
                continue;
            const url = new URL(src, baseUrl);
            if (url.protocol === 'file:') {
                const entryPath = new EntryPath(decodeURI(url.pathname));
                const entry = await entryService.createEntryFromPath({ entryPath, fileSystem, signal });
                if (entry === null) {
                    image.removeAttribute('src');
                    continue;
                }
                const content = await entryService.readFile({ entry: entry as FileEntry, fileSystem, signal });
                const type =
                    /\.jpe?g/i.test(entryPath.toString()) ? 'image/jpeg' :
                    /\.png/i.test(entryPath.toString()) ? 'image/png' :
                    /\.gif/i.test(entryPath.toString()) ? 'image/gif' :
                    /\.webp/i.test(entryPath.toString()) ? 'image/webp' :
                    /\.svg/i.test(entryPath.toString()) ? 'image/svg+xml' :
                    'application/octet-stream';
                image.src = `data:${type};base64,${content.toString('base64')}`;
            }
        }
        // eslint-disable-next-line @typescript-eslint/naming-convention
        return { __html: doc.body.innerHTML };
    }, [baseUrl, fileSystem, markdown]);

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

declare module '../../hooks/use-service' {
    interface Services {
        'components/entry-views/markdown-entry-view': {
            entryService: EntryService;

            historyController: HistoryController;
        };
    }
}
