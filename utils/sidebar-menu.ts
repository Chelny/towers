import { MenuItem, SidebarMenuActionItem, SidebarMenuLinkItem } from "@/interfaces/sidebar-menu";

export const isLinkItem = (item: MenuItem): item is SidebarMenuLinkItem => {
  return "href" in item;
};

export const isNotificationItem = (item: MenuItem): item is SidebarMenuActionItem => {
  return "children" in item && Array.isArray(item.children);
};
