"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { useLingui } from "@lingui/react/macro";
import clsx from "clsx/lite";
import { TowersNotificationWithRelations } from "db";
import { GoTriangleDown, GoTriangleLeft } from "react-icons/go";
import { NotificationDropdownItem } from "@/components/NotificationDropdownItem";
import { MenuItem, SidebarMenuActionItem, SidebarMenuLinkItem } from "@/interfaces/sidebar-menu";
import { isActionItem, isButtontem, isLinkItem } from "@/utils/sidebar-menu";

type SidebarMenuSubItemProps = {
  item: MenuItem
  isActiveHref: (path: string) => boolean
  isLast: boolean
  level: number
}

export function SidebarMenuSubItem({ item, isActiveHref, isLast, level }: SidebarMenuSubItemProps): ReactNode {
  const { i18n, t } = useLingui();
  const isTreeActive: boolean | undefined =
    (isLinkItem(item) && isActiveHref(item.href)) ||
    ("children" in item && item.children?.some((c: MenuItem) => isLinkItem(c) && isActiveHref(c.href)));
  const [isOpen, setIsOpen] = useState<boolean>(!!isTreeActive);
  const [isDropdownVisible, setIsDropdownVisible] = useState<boolean>(false);

  // Link: Rooms and Tables
  if (isLinkItem(item)) {
    const hasChildren: boolean = !!item.children?.length;

    return (
      <li>
        <div
          className={clsx(
            "relative flex items-center justify-between w-auto ps-6 ms-7",
            // Vertical line (rooms and tables)
            "before:content-[''] before:absolute before:block before:top-0 before:start-0 before:w-px",
            // T shape
            level > 0 &&
              "after:content-[''] after:block after:absolute after:top-1/2 after:start-0 after:-translate-y-1/2 after:w-4 after:h-px",
            // L shape
            level > 0 && isLast ? "before:h-5" : "before:h-full",
            isActiveHref(item.href) ? "before:bg-white after:bg-white" : "before:bg-white/15 after:bg-white/15",
          )}
        >
          <Link
            href={item.href}
            className={clsx(
              "flex-1 p-2 rounded-md",
              "hover:bg-slate-700 hover:text-white",
              isActiveHref(item.href) && "text-white/85 font-medium",
            )}
          >
            {item.label}
          </Link>

          {hasChildren && (
            <button
              type="button"
              className={clsx("p-2 rounded-md text-white/70", "hover:bg-slate-700")}
              aria-label={
                isOpen
                  ? i18n._("Collapse {label}", { label: item.label })
                  : i18n._("Expand {label}", { label: item.label })
              }
              aria-haspopup="true"
              aria-controls={`link-item-${item.id}-list`}
              aria-expanded={isOpen}
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <GoTriangleDown /> : <GoTriangleLeft className="rtl:-scale-x-100" />}
            </button>
          )}
        </div>

        {hasChildren && isOpen && (
          <ul id={`link-item-${item.id}-list`}>
            {item.children!.map(
              (
                child: SidebarMenuLinkItem | SidebarMenuActionItem,
                index: number,
                arr: (SidebarMenuLinkItem | SidebarMenuActionItem)[],
              ) => (
                <SidebarMenuSubItem
                  key={child.id}
                  item={child}
                  isActiveHref={isActiveHref}
                  isLast={index === arr.length - 1}
                  level={level + 1}
                />
              ),
            )}
          </ul>
        )}
      </li>
    );
  }

  // Instant Messages
  if (isButtontem(item)) {
    return (
      <li>
        <div
          className={clsx(
            "relative flex items-center justify-between w-auto ps-6 ms-8",
            // Vertical line (rooms and tables)
            "before:content-[''] before:absolute before:block before:top-0 before:start-0 before:w-px",
            // T shape
            level > 0 &&
              "after:content-[''] after:block after:absolute after:top-1/2 after:start-0 after:-translate-y-1/2 after:w-4 after:h-px",
            // L shape
            level > 0 && isLast ? "before:h-5" : "before:h-full",
          )}
        >
          <button
            type="button"
            className="flex items-center gap-2 w-full"
            onClick={() => {
              item.onClick();
            }}
          >
            <span className={clsx("flex-1 text-start truncate", item.unreadCount > 0 && "text-white font-medium")}>
              {item.label}
            </span>

            {item.unreadCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-red-500 text-white text-xs font-semibold">
                {item.unreadCount > 99 ? "99+" : item.unreadCount}
              </span>
            )}
          </button>
        </div>
      </li>
    );
  }

  // Action: Table Invitations, Table Declines and Table Boots notifications
  if (isActionItem(item)) {
    const unreadCount: number = item.unreadCount ?? 0;

    return (
      <li
        className={clsx(
          "relative ms-7 ps-6",
          // Vertical line (notifications)
          "before:content-[''] before:absolute before:block before:top-0 before:start-0 before:w-px",
          // T shape
          level > 0 &&
            "after:content-[''] after:block after:absolute after:top-1/2 after:start-0 after:-translate-y-1/2 after:w-4 after:h-px",
          // L shape
          level > 0 && isLast ? "before:h-5" : "before:h-full",
          "before:bg-white/15 after:bg-white/15",
        )}
      >
        <button
          type="button"
          className={clsx(
            "group/action-button flex justify-between items-center w-full p-2 rounded-md text-white/80",
            "hover:bg-slate-700",
          )}
          aria-haspopup="menu"
          aria-controls={`action-item-${item.id}-menu`}
          aria-expanded={isDropdownVisible}
          onMouseEnter={() => setIsDropdownVisible(true)}
          onMouseLeave={() => setIsDropdownVisible(false)}
        >
          <span className="flex items-center gap-2">
            {item.label}

            {unreadCount > 0 && (
              <span className="inline-flex justify-center min-w-[1.5rem] px-1.5 py-0.5 rounded-full bg-red-600 text-white text-xs font-semibold leading-none">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </span>
          <GoTriangleLeft
            className={clsx("opacity-70 -scale-x-100", "group-hover/action-button:opacity-100", "rtl:scale-x-100")}
          />
        </button>

        {isDropdownVisible && (
          <ul
            id={`action-item-${item.id}-menu`}
            className="overflow-y-auto absolute top-0 start-full z-40 w-[350px] max-h-96 p-2 divide-y divide-white/10 border border-slate-700 rounded-sm shadow-lg bg-slate-800 cursor-pointer"
            role="menu"
            tabIndex={0}
            onMouseEnter={() => setIsDropdownVisible(true)}
            onMouseLeave={() => setIsDropdownVisible(false)}
          >
            {item.children && item.children.length > 0 ? (
              item.children?.map((notification: TowersNotificationWithRelations) => (
                <NotificationDropdownItem key={notification.id} notification={notification} />
              ))
            ) : (
              <li role="presentation" className="px-3 py-1 text-white/70 text-center">
                {t({ message: "No notifications" })}
              </li>
            )}
          </ul>
        )}
      </li>
    );
  }

  return null;
}
