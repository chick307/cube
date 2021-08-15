import hljs from 'highlight.js';
import highlightStyles from 'highlight.js/styles/base16/solarized-dark.css';
import { JSDOM } from 'jsdom';
import React from 'react';

import styles from './highlight.css';

hljs.registerAliases('jsonc', { languageName: 'json' });

export type Props = {
    className?: string;
    code: string;
    language: string;
};

const highlight = (params: {
    code: string;
    language?: string | null;
}): JSX.Element[] => {
    const result = hljs.highlightAuto(params.code, ...(params.language ? [[params.language]] : []));
    const fragment = JSDOM.fragment(result.value);
    const lines = [] as JSX.Element[];
    let keyCounter = 0;
    const walk = (node: ChildNode, context: {
        emitContent(content: React.ReactNode): void;
        emitLineBreak(): void;
    }) => {
        if (node.nodeName === '#text') {
            (node.textContent ?? '').split('\n').forEach((text, index) => {
                if (index !== 0)
                    context.emitLineBreak();
                context.emitContent(text);
            });
        } else if (!node.nodeName.startsWith('#')) {
            const tagName = node.nodeName.toLowerCase();
            const className = Array.from((node as HTMLElement).classList)
                .map((name) => highlightStyles[name])
                .filter((name) => name)
                .join(' ');
            let children = [] as React.ReactNode[];
            for (const childNode of Array.from(node.childNodes)) {
                walk(childNode, {
                    emitContent: (node) => {
                        children.push(node);
                    },
                    emitLineBreak: () => {
                        if (children.length !== 0) {
                            const key = keyCounter++;
                            context.emitContent(React.createElement(tagName, { className, key }, ...children));
                            children = [];
                        }
                        context.emitLineBreak();
                    },
                });
            }
            if (children.length !== 0) {
                const key = keyCounter++;
                context.emitContent(React.createElement(tagName, { className, key }, ...children));
            }
        }
    };
    {
        const className = styles.line;
        let children = [] as React.ReactNode[];
        for (const childNode of Array.from(fragment.childNodes)) {
            walk(childNode, {
                emitContent: (node) => {
                    children.push(node);
                },
                emitLineBreak: () => {
                    const key = keyCounter++;
                    children.push('\n');
                    lines.push(<div {...{ children, className, key }} />);
                    children = [];
                },
            });
        }
        if (!(children.length === 1 && children[0] === '') && children.length !== 0) {
            const key = keyCounter++;
            lines.push(<div {...{ className, children, key }} />);
        }
    }
    return lines;
};

export const Highlight = (props: Props) => {
    const { className = '', code, language } = props;

    const lines = React.useMemo(() => {
        let lineNumber = 1;
        const lines = [] as React.ReactNode[];
        for (const line of highlight({ code, language })) {
            lines.push(<div key={lines.length} className={styles.lineNumber}>{lineNumber.toString()}</div>);
            lines.push(React.cloneElement(line, { key: lines.length }));
            lineNumber++;
        }
        return lines;
    }, [code, language]);

    return (
        <div className={`${className} ${styles.view} ${highlightStyles.hljs}`}>
            {lines}
        </div>
    );
};
