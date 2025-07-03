"use client"

import { useEffect } from "react"
import { useLingui } from "@lingui/react/macro"
import clsx from "clsx/lite"
import { MdOutlineDelete } from "react-icons/md"
import { useGame } from "@/context/GameContext"
import { useOnScreen } from "@/hooks/useOnScreen"
import { SidebarMenuDropdownItem } from "@/interfaces/sidebar-menu"

type NotificationDropdownItemProps = {
  item: SidebarMenuDropdownItem
}

export const NotificationDropdownItem = ({ item }: NotificationDropdownItemProps) => {
  const { t } = useLingui()
  const { removeNotification, markNotificationRead } = useGame()
  const [ref, isInView] = useOnScreen<HTMLLIElement>()

  useEffect(() => {
    if (isInView && item.notification.status === "unread") {
      markNotificationRead(item.roomId, item.notification.id)
    }
  }, [isInView, item.notification.id, item.notification.status, item.roomId, markNotificationRead])

  return (
    <li ref={ref} className={clsx("flex justify-between items-start gap-1 w-full", "hover:bg-slate-700")}>
      <button
        type="button"
        className={clsx(
          "flex-1 px-3 py-1 text-start",
          item.notification.status === "read" ? "text-white/50" : "text-white/80",
        )}
        onClick={item.onClick}
      >
        {item.label}
      </button>

      <button
        type="button"
        className="p-2 text-red-500"
        aria-label={t({ message: "Delete notification" })}
        onClick={() => removeNotification(item.roomId, item.notification.id)}
      >
        <MdOutlineDelete aria-hidden="true" />
      </button>
    </li>
  )
}
