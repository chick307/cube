import { highlight } from 'highlight.js';
import highlightStyles from 'highlight.js/styles/solarized-dark.css';

import { FileEntry } from '../../common/entities/file-entry';
import { FileSystem } from '../../common/entities/file-system';
import { useEntryService } from '../contexts/entry-service-context';
import { useTask } from '../hooks/use-task';
import styles from './css-file-view.css';

export type Props = {
    className?: string;
    entry: FileEntry;
    fileSystem: FileSystem;
};

const unescapeHtmlEntity = (html: string) => {
    return html.replace(/&(amp|gt|lt|quot);/g, (text, name) => {
        switch (name) {
            case 'amp': return '&';
            case 'gt': return '>';
            case 'lt': return '<';
            case 'quot': return '"';
            default: return text;
        }
    });
};

export const CssFileView = (props: Props) => {
    const { className = '', entry, fileSystem } = props;

    const entryService = useEntryService();

    const [lines = []] = useTask(async (signal) => {
        const buffer = await entryService.readFile({ entry, fileSystem }, { signal });
        const content = buffer.toString('utf8');
        const result = highlight(content, { language: 'css', ignoreIllegals: true });
        const lines: React.ReactNode[] = [];
        const regexp = /\n()|<span\s+class="(.*?)">|<\/span>()|([^<>\n]+)/g;
        const classList: string[] = [];
        let line: React.ReactNode[] = [];
        let match: RegExpExecArray | null;
        while ((match = regexp.exec(result.value)) !== null) {
            if (match[1] === '') {
                const lineNumber = lines.length / 2 + 1;
                lines.push(<div key={lines.length} className={styles.lineNumber}>{lineNumber.toString()}</div>);
                lines.push(<div key={lines.length} className={styles.line}>{line}{'\n'}</div>);
                line = [];
            } else if (match[2] != null) {
                classList.push(highlightStyles[match[2]]);
            } else if (match[3] === '') {
                classList.pop();
            } else {
                line.push((
                    <span key={line.length} className={classList.join(' ')}>{unescapeHtmlEntity(match[4])}</span>
                ));
            }
        }
        if (line.length !== 0)
            lines.push(<div key={lines.length} className={styles.line}>{line}</div>);
        return lines;
    }, [entry, entryService, fileSystem]);

    return (
        <div className={`${className} ${styles.view}`}>
            <div className={`${styles.code} ${highlightStyles.hljs}`}>
                {lines}
            </div>
        </div>
    );
};

export const isCssEntry = (entry: FileEntry) =>
    /^\.(?:css)$/i.test(entry.path.getExtension());
