import highlightStyles from 'highlight.js/styles/base16/solarized-dark.css';
import React from 'react';
import rehypeReact from 'rehype-react';
import { unified } from 'unified';

import type { Entry } from '../../../common/entities/entry';
import type { FileSystem } from '../../../common/entities/file-system';
import { Point } from '../../../common/values/point';
import type { TextViewerState } from '../../../common/values/viewer-state';
import type { HistoryController } from '../../controllers/history-controller';
import type { TextViewerControllerFactory } from '../../factories/viewer-controller-factory';
import { useStatusBarGateway } from '../../gateways/status-bar-gateway';
import { useRestate } from '../../hooks/use-restate';
import { useService } from '../../hooks/use-service';
import { useTask } from '../../hooks/use-task';
import { rehypeCssModules } from '../../utils/rehype-css-modules';
import { StatusBarSelect } from '../status-bar/status-bar-select';
import { StatusBarSpace } from '../status-bar/status-bar-space';
import styles from './text-viewer.module.css';

export type Props = {
    className?: string;

    entry: Entry;

    fileSystem: FileSystem;

    viewerState: TextViewerState;
};

export const TextViewer = (props: Props) => {
    const {
        className: classNameProp,
        entry,
        fileSystem,
        viewerState,
    } = props;

    const historyController = useService('historyController');
    const viewerControllerFactory = useService('viewerControllerFactory');

    const viewerController = React.useMemo(() => {
        return viewerControllerFactory.createTextViewerController({ historyController });
    }, [viewerControllerFactory, historyController]);

    viewerController.initialize({ entry, fileSystem, viewerState });

    const viewerElementRef = React.useRef<HTMLDivElement>(null);

    const StatusBarGateway = useStatusBarGateway();

    const {
        language,
        lines,
        scrollPosition,
    } = useRestate(viewerController.state);

    const className = classNameProp == null ? styles.textViewer : `${styles.textViewer} ${classNameProp}`;

    const lineNumberClassName = `${highlightStyles.hljs} ${highlightStyles.hljsComment} ${styles.lineNumber}`;

    const [lineElements = null] = useTask<React.ReactNode[] | null>(async (signal) => {
        if (lines === null)
            return null;

        const lineElements: React.ReactNode[] = [];
        for (const line of lines) {
            const processor = unified()
                .use(() => {
                    processor.Parser = () => line.tree;
                })
                .use(rehypeCssModules, {
                    styles: { ...highlightStyles },
                })
                .use(rehypeReact, {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    Fragment: React.Fragment,
                    createElement: React.createElement,
                });
            const file = await signal.wrapPromise(processor.process({}));
            const content = file.result;
            lineElements.push(
                <div key={line.lineNumber} className={styles.line}>
                    <span className={lineNumberClassName}>{line.lineNumber}</span>
                    <span className={styles.lineContent}>{content}</span>
                </div>,
            );
        }
        return lineElements;
    }, [lines]);

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
        if (lineElements === null)
            return;

        const viewerElement = viewerElementRef.current as HTMLDivElement;
        const container = viewerElement?.offsetParent as HTMLElement | null | undefined;
        if (container == null)
            return;
        container.scrollTo(scrollPosition.x, scrollPosition.y);
    }, [lineElements]);

    const onLanguageChange = React.useCallback((value: string) => {
        viewerController.setLanguage(value);
    }, [viewerController]);

    const languageOptions = StatusBarSelect.useOptions(() => [
        { label: 'Plain Text', value: 'plaintext' },
        { label: 'CSS', value: 'css' },
        { label: 'JavaScript', value: 'javascript' },
        { label: 'Markdown', value: 'markdown' },
        { label: 'TypeScript', value: 'typescript' },
    ], []);

    return (
        <div ref={viewerElementRef} {...{ className }}>
            <pre>
                <code className={highlightStyles.hljs}>
                    <div className={styles.textContents}>
                        {lineElements}
                    </div>
                </code>
            </pre>
            <StatusBarGateway>
                <StatusBarSpace />
                <StatusBarSelect value={language} onChange={onLanguageChange} options={languageOptions} />
            </StatusBarGateway>
        </div>
    );
};

declare module '../../hooks/use-service' {
    interface Services {
        'components/viewers/text-viewer': {
            historyController: HistoryController;

            viewerControllerFactory: TextViewerControllerFactory;
        };
    }
}
