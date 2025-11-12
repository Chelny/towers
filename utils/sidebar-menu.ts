import { MenuItem, SidebarMenuActionItem, SidebarMenuButtonItem, SidebarMenuLinkItem } from "@/interfaces/sidebar-menu";

export const isLinkItem = (item: MenuItem): item is SidebarMenuLinkItem => {
  return "href" in item;
};

export const isButtontem = (item: MenuItem): item is SidebarMenuButtonItem => {
  return "onClick" in item;
};

export const isActionItem = (item: MenuItem): item is SidebarMenuActionItem => {
  return "children" in item && Array.isArray(item.children);
};
