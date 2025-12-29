"use client";

import { ReactNode } from "react";
import { useLingui } from "@lingui/react/macro";
import {
  BsSortAlphaDown,
  BsSortAlphaDownAlt,
  BsSortDown,
  BsSortNumericDown,
  BsSortNumericDownAlt,
  BsSortUp,
} from "react-icons/bs";
import { IconType } from "react-icons/lib";

type SortDirection = "asc" | "desc";
type SortVariant = "alpha" | "numeric" | "generic";

type SortIconProps = {
  direction: SortDirection
  variant?: SortVariant
  isActive?: boolean
  className?: string
};

export function SortIcon({ direction, variant = "generic", isActive = false }: SortIconProps): ReactNode {
  const { t } = useLingui();

  if (!isActive) return null;

  const aria: string = direction === "asc" ? t({ message: "Sort ascending" }) : t({ message: "Sort descending" });

  const Icon: IconType =
    variant === "alpha"
      ? direction === "asc"
        ? BsSortAlphaDown
        : BsSortAlphaDownAlt
      : variant === "numeric"
        ? direction === "asc"
          ? BsSortNumericDown
          : BsSortNumericDownAlt
        : direction === "asc"
          ? BsSortUp
          : BsSortDown;

  return <Icon aria-label={aria} />;
}
