import highlightStyles from 'highlight.js/styles/base16/solarized-dark.css';
import katextStyles from 'katex/dist/katex.css';
import React from 'react';
import rehypeReact from 'rehype-react';
import { unified } from 'unified';

import type { Entry } from '../../../../common/entities/entry';
import type { FileSystem } from '../../../../common/entities/file-system';
import type { MarkdownViewerState } from '../../../../common/values/viewer-state';
import type { HistoryController } from '../../../controllers/history-controller';
import type { TabController } from '../../../controllers/tab-controller';
import type { MarkdownViewerControllerFactory } from '../../../factories/viewer-controller-factory';
import { useRestate } from '../../../hooks/use-restate';
import { ServiceProvider, useService } from '../../../hooks/use-service';
import { useTask } from '../../../hooks/use-task';
import { rehypeCssModules } from '../../../utils/rehype-css-modules';
import { MarkdownBlockquote } from './markdown-blockquote';
import { MarkdownCode } from './markdown-code';
import { MarkdownImage } from './markdown-image';
import { MarkdownLink } from './markdown-link';
import { MarkdownParagraph } from './markdown-paragraph';
import { MarkdownTable } from './markdown-table';
import styles from './markdown-viewer.module.css';

export type Props = {
    className?: string;

    entry: Entry;

    fileSystem: FileSystem;

    viewerState: MarkdownViewerState;
};

export const MarkdownViewer = (props: Props) => {
    const {
        className: classNameProp,
        entry,
        fileSystem,
        viewerState,
    } = props;

    const historyController = useService('historyController');
    const tabController = useService('tabController');
    const viewerControllerFactory = useService('viewerControllerFactory');

    const viewerController = React.useMemo(() => {
        return viewerControllerFactory.createMarkdownViewerController({ historyController, tabController });
    }, [viewerControllerFactory, historyController]);

    viewerController.initialize({ entry, fileSystem, viewerState });

    const {
        tree,
    } = useRestate(viewerController.state);

    const className = classNameProp == null ? styles.markdownViewer : `${styles.markdownViewer} ${classNameProp}`;

    const [markdownElement = null] = useTask<React.ReactNode>(async (signal) => {
        if (tree == null)
            return null;
        const processor = unified()
            .use(() => {
                processor.Parser = () => tree;
            })
            .use(rehypeCssModules, {
                styles: { ...highlightStyles, ...katextStyles },
            })
            .use(rehypeReact, {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                Fragment: React.Fragment,
                components: {
                    a: MarkdownLink,
                    blockquote: MarkdownBlockquote,
                    code: MarkdownCode,
                    img: MarkdownImage,
                    p: MarkdownParagraph,
                    table: MarkdownTable,
                },
                createElement: React.createElement,
            });
        const file = await signal.wrapPromise(processor.process({}));
        const element = file.result;
        return element;
    }, [tree]);

    return (
        <div {...{ className }}>
            <ServiceProvider name={'markdownViewerController'} value={viewerController}>
                <div className={styles.markdownRoot}>
                    {markdownElement}
                </div>
            </ServiceProvider>
        </div>
    );
};

declare module '../../../hooks/use-service' {
    interface Services {
        'components/viewers/markdown-viewer/markdown-viewer': {
            historyController: HistoryController;

            tabController: TabController;

            viewerControllerFactory: MarkdownViewerControllerFactory;
        };
    }
}
