import { GameNotification } from "@/context/GameContext"

export interface SidebarMenuBaseItem {
  id: string
  label: string
}

export interface SidebarMenuLinkItem extends SidebarMenuBaseItem {
  href: string
  children?: (SidebarMenuLinkItem | SidebarMenuActionItem)[]
}

export interface SidebarMenuActionItem extends SidebarMenuBaseItem {
  children: SidebarMenuDropdownItem[]
  unreadCount: number
}

export interface SidebarMenuDropdownItem extends SidebarMenuBaseItem {
  roomId: string
  notification: GameNotification
  onClick: () => void
}

export type MenuItem = SidebarMenuLinkItem | SidebarMenuActionItem | SidebarMenuDropdownItem
