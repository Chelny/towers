import { MouseEvent, RefObject, useCallback, useState } from "react";
import { ContextMenuState } from "@/components/ui/ContextMenu";

interface ContextMenu<T> {
  menu: ContextMenuState<T>
  openMenu: (event: MouseEvent, data: T) => void
  closeMenu: () => void
}

export function useContextMenu<T>(containerRef?: RefObject<HTMLElement | null>): ContextMenu<T> {
  const [menu, setMenu] = useState<ContextMenuState<T>>(null);

  const openMenu = useCallback(
    (event: MouseEvent, data: T) => {
      event.preventDefault();
      event.stopPropagation();

      let clickX: number = event.clientX;
      let clickY: number = event.clientY;

      // If a container is provided, calculate relative to it
      if (containerRef?.current) {
        const rect: DOMRect = containerRef.current.getBoundingClientRect();
        clickX = event.clientX - rect.left;
        clickY = event.clientY - rect.top;
      }

      const rootW: number = 180;
      const rootH: number = 120;

      // Automatically reposition the menu so it stays fully inside the container or window
      const maxW: number = containerRef?.current?.clientWidth ?? window.innerWidth;
      const maxH: number = containerRef?.current?.clientHeight ?? window.innerHeight;

      const left: number = clickX + rootW > maxW ? clickX - rootW : clickX;
      const top: number = clickY + rootH > maxH ? clickY - rootH : clickY;

      setMenu({ x: left, y: top, data });
    },
    [containerRef],
  );

  const closeMenu = useCallback(() => setMenu(null), []);

  return { menu, openMenu, closeMenu };
}
