import styles from './markdown-table.module.css';

export type Props = React.DetailedHTMLProps<React.TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>;

export const MarkdownTable = (props: Props) => {
    const {
        className: classNameProp,
        ...elementProps
    } = props;

    const className =
        classNameProp == null ? styles.markdownTable : `${classNameProp} ${styles.markdownTable}`;

    return <table {...{ ...elementProps, className }} />;
};
