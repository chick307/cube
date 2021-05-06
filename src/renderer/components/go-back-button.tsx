import React from 'react';

import { useStore } from '../hooks/use-store';
import { HistoryStore } from '../stores/history-store';
import { Button, Props as ButtonProps } from './button';

export type Props = ButtonProps & {
    historyStore: HistoryStore;
};

export const GoBackButton = (props: Props) => {
    const {
        historyStore,
        disabled: buttonDisabled,
        onClick: buttonOnClick,
        children: buttonChildren,
        ...buttonProps
    } = props;

    const historyStoreState = useStore(historyStore);

    const disabled = React.useMemo(() => buttonDisabled || !historyStore.canGoBack(), [buttonDisabled, historyStoreState]);

    const onClick = React.useCallback((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (buttonOnClick != null)
            buttonOnClick(event);
        if (!event.isDefaultPrevented())
            historyStore.goBack();
    }, [historyStore]);

    const children = React.useMemo(() => buttonChildren || <>
        <svg width="16" height="16" fill="#666666" viewBox="0 0 24 24">
            <use xlinkHref="images/icons.svg#arrow-left" />
        </svg>
    </>, [buttonChildren]);

    return <>
        <Button {...{ disabled, onClick, children, ...buttonProps }} />
    </>;
};
