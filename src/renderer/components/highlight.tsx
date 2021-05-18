import { highlight } from 'highlight.js';
import highlightStyles from 'highlight.js/styles/solarized-dark.css';
import React from 'react';

import styles from './highlight.css';

export type Props = {
    className?: string;
    code: string;
    language: string;
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

export const Highlight = (props: Props) => {
    const { className = '', code, language } = props;

    const lines = React.useMemo(() => {
        const result = highlight(code, { language, ignoreIllegals: true });
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
    }, [code, language]);

    return (
        <div className={`${className} ${styles.view} ${highlightStyles.hljs}`}>
            {lines}
        </div>
    );
};
