import styles from './tab-view-drag-over-indicator.module.css';

export type Props = {
    className?: string;
};

export const TabViewDragOverIndicator = (props: Props) => {
    const className = `${styles.indicator} ${props.className ?? ''}`;

    return (
        <span {...{ className }}>
            {indicator}
        </span>
    );
};

const indicator = (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
        <polygon fillRule="evenodd" points="11 3 6 10 1 3"/>
    </svg>
);
