"use client";

import { PropsWithChildren, ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { ReadonlyURLSearchParams, usePathname, useSearchParams } from "next/navigation";
import clsx from "clsx/lite";
import { GoTriangleDown, GoTriangleLeft } from "react-icons/go";
import { IconType } from "react-icons/lib";
import { SidebarMenuSubItem } from "@/components/SidebarMenuSubItem";
import { MenuItem } from "@/interfaces/sidebar-menu";
import { Language, languages } from "@/translations/languages";
import { isLinkItem } from "@/utils/sidebar-menu";

type SidebarMenuItemProps = PropsWithChildren<{
  id: string
  Icon: IconType
  ariaLabel: string
  isExpanded?: boolean
  href?: string
  menuItems?: MenuItem[]
  isBadgeVisible?: boolean
  isModalOpen?: boolean
  disabled?: boolean
  onClick?: () => void
}>;

export default function SidebarMenuItem({
  children,
  id,
  Icon,
  ariaLabel,
  isExpanded = false,
  href = undefined,
  menuItems = [],
  isBadgeVisible = false,
  isModalOpen = false,
  disabled = false,
  onClick,
}: SidebarMenuItemProps): ReactNode {
  const pathname: string = usePathname();
  const searchParams: ReadonlyURLSearchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const stripLocale = (path: string): string => {
    const segments: string[] = path.split("/").filter(Boolean);
    const locales: string[] = languages.map((language: Language) => language.locale);

    if (locales.includes(segments[0])) {
      segments.shift();
    }

    return "/" + segments.join("/");
  };

  const isActiveHref = (href: string): boolean => {
    const url: URL = new URL(href, process.env.BASE_URL);
    const base: string = url.pathname;
    const expectedQuery: URLSearchParams = url.searchParams;
    const cleanPath: string = stripLocale(pathname);

    if (cleanPath !== base) return false;
    if (expectedQuery.size === 0) return searchParams.size === 0;
    if (expectedQuery.size !== searchParams.size) return false;

    for (const [key, val] of expectedQuery.entries()) {
      if (searchParams.get(key) !== val) return false;
    }

    return true;
  };

  const isItemTreeActive = (item: MenuItem, isActiveHref: (href: string) => boolean): boolean => {
    if (isLinkItem(item) && isActiveHref(item.href)) return true;
    if ("children" in item && item.children) {
      return item.children.some((child: MenuItem) => isItemTreeActive(child, isActiveHref));
    }
    return false;
  };

  const isItemActive: boolean = menuItems.some(
    (menuItem: MenuItem) =>
      ("href" in menuItem && isActiveHref(menuItem.href)) || isItemTreeActive(menuItem, isActiveHref),
  );

  const [isAccordionOpen, setAccordionOpen] = useState<boolean>(() => isItemActive);

  const handleClick = (): void => {
    if (menuItems.length > 0) {
      if (!isExpanded) {
        onClick?.();
      } else {
        setAccordionOpen((prev: boolean) => !prev);
      }
    } else {
      onClick?.();
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setAccordionOpen(isItemActive);
  }, [isItemActive]);

  return (
    <div
      className={clsx(
        "rounded-md overflow-visible",
        isExpanded ? "w-full" : "w-auto",
        href && isExpanded && isActiveHref(href) ? "bg-slate-700" : "text-white/70",
      )}
    >
      {href ? (
        <Link
          className={clsx(
            "flex items-center gap-3 w-full p-2",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            href && isActiveHref(href) && "text-white/90 font-medium",
          )}
          href={href}
          aria-label={isExpanded ? undefined : ariaLabel}
        >
          <span
            className={clsx(
              "relative p-2 border-2 rounded-md",
              href && isActiveHref(href)
                ? "border-slate-300/50 bg-slate-400/50 text-white/90"
                : "border-slate-600 bg-slate-700 text-white/70",
            )}
          >
            <Icon className="w-4 h-4 rtl:-scale-y-100 rtl:-rotate-180" aria-hidden="true" />
          </span>
          <span
            className={clsx("transition-opacity duration-300", isExpanded ? "block opacity-100" : "hidden opacity-0")}
          >
            {children}
          </span>
        </Link>
      ) : (
        <button
          type="button"
          className={clsx(
            "flex items-center gap-3 w-full p-2 rounded-md",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            isExpanded && isItemActive && "bg-slate-600 text-white/90 font-medium",
          )}
          disabled={isMounted ? disabled : false}
          aria-label={ariaLabel}
          aria-expanded={menuItems.length > 0 ? isAccordionOpen : undefined}
          aria-controls={menuItems.length > 0 ? `menu-item-${id}-list` : undefined}
          onClick={handleClick}
        >
          <span
            className={clsx(
              "relative p-2 border-2 rounded-md",
              isItemActive || isModalOpen
                ? "border-slate-300/50 bg-slate-400/50 text-white/90"
                : "border-slate-600 bg-slate-700 text-white/70",
            )}
          >
            <Icon className="w-4 h-4 rtl:-scale-y-100 rtl:-rotate-180" aria-hidden="true" />
            {isBadgeVisible && <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-red-500"></span>}
          </span>
          <span
            className={clsx(
              "flex justify-between items-center w-full transition-opacity duration-300",
              isExpanded ? "block opacity-100" : "hidden opacity-0",
            )}
          >
            {menuItems.length > 0 ? (
              <>
                <span>{children}</span>
                {isAccordionOpen ? <GoTriangleDown /> : <GoTriangleLeft className="rtl:-scale-x-100" />}
              </>
            ) : (
              children
            )}
          </span>
        </button>
      )}

      {menuItems.length > 0 && isExpanded && (
        <ul
          id={`menu-item-${id}-list`}
          className={clsx(
            "flex flex-col transition-[max-height] duration-200",
            isAccordionOpen ? "overflow-visible max-h-screen my-2" : "overflow-hidden max-h-0",
          )}
        >
          {menuItems.map((menuItem: MenuItem, index, arr) => (
            <SidebarMenuSubItem
              key={menuItem.id}
              item={menuItem}
              isActiveHref={isActiveHref}
              isLast={index === arr.length - 1}
              level={0}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
