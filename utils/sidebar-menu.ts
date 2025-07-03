import {
  MenuItem,
  SidebarMenuActionItem,
  SidebarMenuDropdownItem,
  SidebarMenuLinkItem,
} from "@/interfaces/sidebar-menu"

export const isLinkItem = (item: MenuItem): item is SidebarMenuLinkItem => {
  return "href" in item
}

export const isActionItem = (item: MenuItem): item is SidebarMenuActionItem => {
  return "children" in item && Array.isArray(item.children)
}

export const isDropdownItem = (item: MenuItem): item is SidebarMenuDropdownItem => {
  return "onClick" in item && !("children" in item)
}
