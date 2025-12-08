"use client";

import { PropsWithChildren, ReactNode } from "react";
import Link from "next/link";
import clsx from "clsx/lite";

type AnchorProps = PropsWithChildren<{
  href: string
  target?: string
  className?: string
  dataTestId?: string
}>;

export default function Anchor({
  children,
  href,
  target = "_self",
  className = "",
  dataTestId = undefined,
}: AnchorProps): ReactNode {
  return (
    <Link
      className={clsx("towers-link", className)}
      href={href}
      target={target}
      rel="noopener noreferrer"
      data-testid={dataTestId}
    >
      {children}
    </Link>
  );
}
