import React from 'react';

import { useHistoryController } from '../../contexts/history-controller-context';
import { useRestate } from '../../hooks/use-restate';
import { Button, Props as ButtonProps } from '../button';
import { ArrowLeftIcon } from '../icons';
import styles from './go-back-button.module.css';

export type Props = ButtonProps;

const defaultIcon = (
    <span className={styles.defaultIcon}>
        {ArrowLeftIcon}
    </span>
);

export const GoBackButton = (props: Props) => {
    const {
        className: classNameProp,
        disabled: buttonDisabled,
        onClick: buttonOnClick,
        children: buttonChildren,
        ...buttonProps
    } = props;

    const historyController = useHistoryController();

    const { ableToGoBack } = useRestate(historyController.state);

    const className = classNameProp == null ? styles.goBackButton : `${styles.goBackButton} ${classNameProp}`;

    const disabled = buttonDisabled || !ableToGoBack;

    const onClick = React.useCallback((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (buttonOnClick != null)
            buttonOnClick(event);
        if (!event.isDefaultPrevented())
            historyController.goBack();
    }, [historyController]);

    const children = React.useMemo(() => buttonChildren || defaultIcon, [buttonChildren]);

    return <>
        <Button {...{ className, disabled, onClick, children, ...buttonProps }} />
    </>;
};
