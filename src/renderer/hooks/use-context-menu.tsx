import React from 'react';

import { useContextMenuService } from '../contexts/context-menu-service-context';
import { ContextMenuItemTemplate } from '../services/context-menu-service';
import styles from './use-context-menu.css';

export type Props = {
    children?: React.ReactNode;
};

export const useContextMenu = (
    templateFactory: () => ContextMenuItemTemplate[],
    deps: React.DependencyList | undefined,
): React.FC<Props> => {
    const templateRef = React.useRef<ContextMenuItemTemplate[]>();

    templateRef.current = React.useMemo(() => templateFactory(), deps);

    const ContextMenu = React.useCallback((props: Props) => {
        const { children } = props;

        const contextMenuService = useContextMenuService();

        const onContextMenu = React.useCallback((event: React.MouseEvent) => {
            event.preventDefault();
            contextMenuService.popupContextMenu({
                template: templateRef.current as ContextMenuItemTemplate[],
                x: event.clientX,
                y: event.clientY,
            });
        }, []);

        return (
            <div className={styles.contextMenu} {...{ onContextMenu }}>
                {children}
            </div>
        );
    }, []);

    return ContextMenu;
};