import React from 'react';

import { useHistoryController } from '../../contexts/history-controller-context';
import { useRestate } from '../../hooks/use-restate';
import { Button, Props as ButtonProps } from '../button';

export type Props = ButtonProps;

export const GoBackButton = (props: Props) => {
    const {
        disabled: buttonDisabled,
        onClick: buttonOnClick,
        children: buttonChildren,
        ...buttonProps
    } = props;

    const historyController = useHistoryController();

    const { ableToGoBack } = useRestate(historyController.state);

    const disabled = buttonDisabled || !ableToGoBack;

    const onClick = React.useCallback((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (buttonOnClick != null)
            buttonOnClick(event);
        if (!event.isDefaultPrevented())
            historyController.goBack();
    }, [historyController]);

    const children = React.useMemo(() => buttonChildren || <>
        <svg width="16" height="16" fill="#666666" viewBox="0 0 24 24">
            <use xlinkHref="images/icons.svg#arrow-left" />
        </svg>
    </>, [buttonChildren]);

    return <>
        <Button {...{ disabled, onClick, children, ...buttonProps }} />
    </>;
};
