import styles from './markdown-paragraph.module.css';

export type Props = React.ComponentProps<'p'>;

export const MarkdownParagraph = (props: Props) => {
    const {
        className: classNameProp,
        ...elementProps
    } = props;

    const className = classNameProp == null ? styles.markdownParagraph : `${classNameProp} ${styles.markdownParagraph}`;

    return <p {...{ ...elementProps, className }} />;
};
