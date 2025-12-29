"use client";

import { ReactNode, useEffect, useState } from "react";
import { useLingui } from "@lingui/react/macro";
import clsx from "clsx/lite";
import { BsChatLeftDots } from "react-icons/bs";
import { LuGamepad2 } from "react-icons/lu";
import { PiSignOut } from "react-icons/pi";
import { RiUserLine } from "react-icons/ri";
import { RiSidebarFoldFill, RiSidebarUnfoldFill } from "react-icons/ri";
import { TbTower } from "react-icons/tb";
import { Socket } from "socket.io-client";
import { AvatarCycler } from "@/components/AvatarCycler";
import ConversationsModal from "@/components/ConversationsModal";
import SidebarMenuItem from "@/components/SidebarMenuItem";
import ThemeToggleButton from "@/components/ThemeToggleButton";
import { ROUTE_PROFILE, ROUTE_RELATIONSHIPS, ROUTE_SETTINGS, ROUTE_TOWERS } from "@/constants/routes";
import { ClientToServerEvents } from "@/constants/socket/client-to-server";
import { ServerToClientEvents } from "@/constants/socket/server-to-client";
import { useConversations } from "@/context/ConversationsContext";
import { GameRoomSummary, GameTableSummary, useGame } from "@/context/GameContext";
import { useModal } from "@/context/ModalContext";
import { useSocket } from "@/context/SocketContext";
import { SidebarMenuActionItem, SidebarMenuLinkItem } from "@/interfaces/sidebar-menu";
import { SocketCallback } from "@/interfaces/socket";
import { authClient } from "@/lib/auth-client";
import { NotificationPlainObject } from "@/server/towers/classes/Notification";

export default function Sidebar(): ReactNode {
  const { i18n, t } = useLingui();
  const { openModal } = useModal();
  const { socketRef, isConnected, session } = useSocket();
  const { joinedRooms, joinedTables } = useGame();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [gameMenuItems, setGameMenuItems] = useState<SidebarMenuLinkItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationPlainObject[]>([]);
  const [isShowUnreadConversationsBadge, setIsShowUnreadConversationsBadge] = useState<boolean>(false);
  const { isOpen: isConversationsModalOpen } = useConversations();

  const getAccountAccordionLinks = (): SidebarMenuLinkItem[] => {
    return [
      { id: ROUTE_PROFILE.ID, label: i18n._(ROUTE_PROFILE.TITLE), href: ROUTE_PROFILE.PATH },
      { id: ROUTE_RELATIONSHIPS.ID, label: i18n._(ROUTE_RELATIONSHIPS.TITLE), href: ROUTE_RELATIONSHIPS.PATH },
      { id: ROUTE_SETTINGS.ID, label: i18n._(ROUTE_SETTINGS.TITLE), href: ROUTE_SETTINGS.PATH },
    ];
  };

  useEffect(() => {
    const items: SidebarMenuLinkItem[] = joinedRooms.map((room: GameRoomSummary) => {
      const roomNotifications: NotificationPlainObject[] = notifications.filter(
        (notification: NotificationPlainObject) => notification.roomId === room.id,
      );

      const unreadRoomNotifications: NotificationPlainObject[] = roomNotifications.filter(
        (notification: NotificationPlainObject) => !notification.readAt,
      );

      const tables: SidebarMenuLinkItem[] = joinedTables
        .filter((table: GameTableSummary) => table.roomId === room.id)
        .map((table: GameTableSummary) => ({
          id: `table-${table.id}`,
          label: i18n._("Table #{tableNumber}", { tableNumber: table.tableNumber }),
          href: `${room.basePath}?room=${room.id}&table=${table.id}`,
        }));

      return {
        id: `room-${room.id}`,
        label: room.name,
        href: `${room.basePath}?room=${room.id}`,
        children: [
          {
            id: `notifications-${room.id}`,
            label: t({ message: "Notifications" }),
            children: roomNotifications,
            unreadCount: unreadRoomNotifications.length,
          } satisfies SidebarMenuActionItem,
          ...tables,
        ],
      };
    });

    setGameMenuItems(items);
  }, [joinedRooms, joinedTables, notifications]);

  useEffect(() => {
    if (!isConnected || !socketRef.current) return;

    const socket: Socket | null = socketRef.current;

    const emitInitialData = (): void => {
      socket.emit(ClientToServerEvents.NOTIFICATIONS, {}, (response: SocketCallback<NotificationPlainObject[]>) => {
        if (response.success && response.data) {
          setNotifications(response.data);
        }
      });

      socket.emit(ClientToServerEvents.CONVERSATIONS_UNREAD, {}, (response: SocketCallback<number>) => {
        if (response.success && response.data) {
          setIsShowUnreadConversationsBadge(response.data > 0);
        }
      });
    };

    const handleUpdateUnreadConversations = ({
      unreadConversationsCount,
    }: {
      unreadConversationsCount: number
    }): void => {
      setIsShowUnreadConversationsBadge(unreadConversationsCount > 0);
    };

    const handleUpdateNotification = ({ notification }: { notification: NotificationPlainObject }): void => {
      setNotifications((prev: NotificationPlainObject[]) =>
        prev.some((n: NotificationPlainObject) => n.id === notification.id)
          ? prev.map((n: NotificationPlainObject) => (n.id === notification.id ? { ...n, ...notification } : n))
          : [...prev, notification],
      );
    };

    const handleDeleteNotification = ({ notificationId }: { notificationId: string }): void => {
      setNotifications((prev: NotificationPlainObject[]) =>
        prev.filter((notification: NotificationPlainObject) => notification.id !== notificationId),
      );
    };

    const attachListeners = (): void => {
      socket.on(ServerToClientEvents.CONVERSATIONS_UNREAD, handleUpdateUnreadConversations);
      socket.on(ServerToClientEvents.TABLE_INVITATION_INVITED_NOTIFICATION, handleUpdateNotification);
      socket.on(ServerToClientEvents.TABLE_INVITATION_DECLINED_NOTIFICATION, handleUpdateNotification);
      socket.on(ServerToClientEvents.TABLE_BOOTED_NOTIFICATION, handleUpdateNotification);
      socket.on(ServerToClientEvents.NOTIFICATION_MARK_AS_READ, handleUpdateNotification);
      socket.on(ServerToClientEvents.NOTIFICATION_DELETE, handleDeleteNotification);
    };

    if (socket.connected) {
      attachListeners();
      emitInitialData();
    } else {
      socket.once("connect", () => {
        attachListeners();
        emitInitialData();
      });
    }

    socket.on("reconnect", () => emitInitialData());

    return () => {
      socket.off(ServerToClientEvents.CONVERSATIONS_UNREAD, handleUpdateUnreadConversations);
      socket.off(ServerToClientEvents.TABLE_INVITATION_INVITED_NOTIFICATION, handleUpdateNotification);
      socket.off(ServerToClientEvents.TABLE_INVITATION_DECLINED_NOTIFICATION, handleUpdateNotification);
      socket.off(ServerToClientEvents.TABLE_BOOTED_NOTIFICATION, handleUpdateNotification);
      socket.off(ServerToClientEvents.NOTIFICATION_MARK_AS_READ, handleUpdateNotification);
      socket.off(ServerToClientEvents.NOTIFICATION_DELETE, handleDeleteNotification);
      socket.off("connect");
      socket.off("reconnect", emitInitialData);
    };
  }, [isConnected, socketRef]);

  const handleOpenConversationsModal = (): void => {
    setIsExpanded(true);
    openModal(ConversationsModal);
  };

  const handleSignOut = async (): Promise<void> => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          socketRef.current?.emit(ClientToServerEvents.SIGN_OUT);
        },
      },
    });
  };

  return (
    <aside
      className={clsx(
        "shrink-0 flex flex-col gap-4 min-w-24 h-full px-2 py-4 border-e border-e-gray-700 shadow-xl bg-gray-800 text-white/90 transition duration-500 ease-in-out",
        isExpanded ? "w-72 items-start" : "w-24 items-center",
      )}
    >
      <div className={clsx("flex flex-col gap-2", isExpanded ? "w-full" : "w-auto")}>
        {/* User avatar and collapse icon */}
        <div className={clsx("flex items-center gap-2", isExpanded ? "w-full" : "w-auto")}>
          <div className={clsx("flex-1 flex items-center gap-4", isExpanded && "ps-2")}>
            <AvatarCycler userId={session?.user.id} initialAvatarId={session?.user.userSettings?.avatarId} />
            {isExpanded && <span className="font-medium">{session?.user.name}</span>}
          </div>
          <div className={isExpanded ? "flex" : "hidden"}>
            <button
              type="button"
              title={t({ message: "Collapse sidebar" })}
              aria-label={t({ message: "Collapse sidebar" })}
              onClick={() => setIsExpanded(false)}
            >
              <RiSidebarFoldFill className={clsx("w-8 h-8 text-white/70", "rtl:-scale-x-100")} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Expand icon */}
        <div className={isExpanded ? "hidden" : "flex justify-center items-center w-full h-8"}>
          <button
            type="button"
            title={t({ message: "Expand sidebar" })}
            aria-label={t({ message: "Expand sidebar" })}
            onClick={() => setIsExpanded(true)}
          >
            <RiSidebarUnfoldFill className={clsx("w-8 h-8 text-white/70", "rtl:-scale-x-100")} aria-hidden="true" />
          </button>
        </div>
      </div>

      <hr className="w-full border-t border-t-slate-600" />

      <nav className="flex flex-col items-center w-full" aria-label={t({ message: "User" })}>
        <SidebarMenuItem
          id="account"
          Icon={RiUserLine}
          ariaLabel={t({ message: "Account" })}
          isExpanded={isExpanded}
          menuItems={getAccountAccordionLinks()}
          onClick={() => setIsExpanded(true)}
        >
          {t({ message: "Account" })}
        </SidebarMenuItem>
        <SidebarMenuItem
          id="instantMessages"
          Icon={BsChatLeftDots}
          ariaLabel={t({ message: "Conversations" })}
          isExpanded={isExpanded}
          isBadgeVisible={isShowUnreadConversationsBadge}
          isModalOpen={isConversationsModalOpen}
          onClick={handleOpenConversationsModal}
        >
          {t({ message: "Conversations" })}
        </SidebarMenuItem>
        <SidebarMenuItem
          id="rooms"
          Icon={LuGamepad2}
          ariaLabel={t({ message: "Rooms" })}
          isExpanded={isExpanded}
          href={ROUTE_TOWERS.PATH}
        >
          {t({ message: "Rooms" })}
        </SidebarMenuItem>
      </nav>

      <hr className="w-full border-t border-t-slate-600" />

      {/* Games */}
      <nav className="flex-1 flex flex-col items-center w-full" aria-label={t({ message: "Games" })}>
        {gameMenuItems?.length > 0 && (
          <SidebarMenuItem
            id="towers"
            Icon={TbTower}
            ariaLabel="Towers"
            isExpanded={isExpanded}
            menuItems={gameMenuItems}
            onClick={() => setIsExpanded(true)}
          >
            Towers
          </SidebarMenuItem>
        )}
      </nav>

      <hr className="w-full border-t border-t-slate-600" />

      {/* Settings and Sign out */}
      <nav className="self-end flex flex-col items-center w-full" aria-label={t({ message: "Settings" })}>
        <ThemeToggleButton isExpanded={isExpanded}></ThemeToggleButton>
        <SidebarMenuItem
          id="sign-out"
          Icon={PiSignOut}
          ariaLabel={t({ message: "Sign out" })}
          isExpanded={isExpanded}
          onClick={handleSignOut}
        >
          {t({ message: "Sign out" })}
        </SidebarMenuItem>
      </nav>
    </aside>
  );
}
