import React from 'react';

import { useStore } from '../hooks/use-store';
import { EntryStore } from '../stores/entry-store';
import { Button, Props as ButtonProps } from './button';

export type Props = ButtonProps & {
    entryStore: EntryStore;
};

export const GoBackButton = (props: Props) => {
    const {
        entryStore,
        disabled: buttonDisabled,
        onClick: buttonOnClick,
        children: buttonChildren,
        ...buttonProps
    } = props;

    const entryStoreState = useStore(entryStore);

    const disabled = React.useMemo(() => buttonDisabled || !entryStore.canGoBack(), [buttonDisabled, entryStoreState]);

    const onClick = React.useCallback((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (buttonOnClick != null)
            buttonOnClick(event);
        if (!event.isDefaultPrevented())
            entryStore.goBack();
    }, [entryStore]);

    const children = React.useMemo(() => buttonChildren || <>
        <svg width="16" height="16" fill="#666666" viewBox="0 0 24 24">
            <use xlinkHref="images/icons.svg#arrow-left" />
        </svg>
    </>, [buttonChildren]);

    return <>
        <Button {...{ disabled, onClick, children, ...buttonProps }} />
    </>;
};
