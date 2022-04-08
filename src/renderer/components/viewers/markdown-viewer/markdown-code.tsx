import highlightStyles from '../../../styles/highlight.module.css';
import styles from './markdown-code.module.css';

export type Props = React.ComponentProps<'code'>;

export const MarkdownCode = (props: Props) => {
    const {
        className: classNameProp,
        ...elementProps
    } = props;

    const className = classNameProp == null ? `${styles.markdownCode} ${highlightStyles.hljs}` :
        `${classNameProp} ${styles.markdownCode} ${highlightStyles.hljs}`;

    return <code {...{ ...elementProps, className }} />;
};
