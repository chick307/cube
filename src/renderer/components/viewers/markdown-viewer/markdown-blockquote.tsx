import styles from './markdown-blockquote.module.css';

export type Props = React.ComponentProps<'blockquote'>;

export const MarkdownBlockquote = (props: Props) => {
    const {
        className: classNameProp,
        ...elementProps
    } = props;

    const className =
        classNameProp == null ? styles.markdownBlockquote : `${classNameProp} ${styles.markdownBlockquote}`;

    return <blockquote {...{ ...elementProps, className }} />;
};
