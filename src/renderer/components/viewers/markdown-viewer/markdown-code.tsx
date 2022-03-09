import highlightStyles from 'highlight.js/styles/base16/solarized-dark.css';

import styles from './markdown-code.module.css';

export type Props = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;

export const MarkdownCode = (props: Props) => {
    const {
        className: classNameProp,
        ...elementProps
    } = props;

    const className = classNameProp == null ? `${styles.markdownCode} ${highlightStyles.hljs}` :
        `${classNameProp} ${styles.markdownCode} ${highlightStyles.hljs}`;

    return <code {...{ ...elementProps, className }} />;
};
