import React from 'react';

import { ContextMenuItemTemplate, ContextMenuService } from '../services/context-menu-service';
import styles from './use-context-menu.module.css';
import { useService } from './use-service';

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

        const contextMenuService = useService('contextMenuService');

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

declare module './use-service' {
    interface Services {
        'hooks/use-context-menu': {
            contextMenuService: ContextMenuService;
        };
    }
}
