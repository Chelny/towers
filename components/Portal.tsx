import { PropsWithChildren, ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type PortalProps = PropsWithChildren<{
  container?: HTMLElement | null
}>;

export default function Portal({ children, container }: PortalProps): ReactNode {
  const [element, setElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (container) {
      setElement(container);
      return;
    }

    const defaultElement: HTMLDivElement = document.createElement("div");
    document.body.appendChild(defaultElement);
    setElement(defaultElement);

    return () => {
      document.body.removeChild(defaultElement);
    };
  }, [container]);

  if (!element) return null;
  return createPortal(children, element);
}
