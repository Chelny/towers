import { TowersNotificationWithRelations } from "db";

export interface SidebarMenuBaseItem {
  id: string
  label?: string
}

export interface SidebarMenuLinkItem extends SidebarMenuBaseItem {
  href: string
  children?: (SidebarMenuLinkItem | SidebarMenuActionItem)[]
}

export interface SidebarMenuButtonItem extends SidebarMenuBaseItem {
  unreadCount: number
  onClick: () => void
}

export interface SidebarMenuActionItem extends SidebarMenuBaseItem {
  children: TowersNotificationWithRelations[]
  unreadCount: number
}

export interface SidebarMenuDropdownItem extends SidebarMenuBaseItem {
  roomId: string
}

export type MenuItem = SidebarMenuLinkItem | SidebarMenuButtonItem | SidebarMenuActionItem | SidebarMenuDropdownItem
