import React from 'react';

import { useHistoryController } from '../../contexts/history-controller-context';
import { useRestate } from '../../hooks/use-restate';
import { Button, Props as ButtonProps } from '../button';
import { ArrowRightIcon } from '../icons';
import styles from './go-forward-button.module.css';

export type Props = ButtonProps;

const defaultIcon = (
    <span className={styles.defaultIcon}>
        {ArrowRightIcon}
    </span>
);

export const GoForwardButton = (props: Props) => {
    const {
        className: classNameProp,
        disabled: buttonDisabled,
        onClick: buttonOnClick,
        children: buttonChildren,
        ...buttonProps
    } = props;

    const historyController = useHistoryController();

    const { ableToGoForward } = useRestate(historyController.state);

    const className = classNameProp == null ? styles.goForwardButton : `${styles.goForwardButton} ${classNameProp}`;

    const disabled = buttonDisabled || !ableToGoForward;

    const onClick = React.useCallback((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (buttonOnClick != null)
            buttonOnClick(event);
        if (!event.isDefaultPrevented())
            historyController.goForward();
    }, [historyController]);

    const children = React.useMemo(() => buttonChildren || defaultIcon, [buttonChildren]);

    return <>
        <Button {...{ className, disabled, onClick, children, ...buttonProps }} />
    </>;
};
