"use client";

import { ReactNode, useEffect, useState } from "react";
import { useLingui } from "@lingui/react/macro";
import clsx from "clsx/lite";
import {
  ConversationParticipant,
  ConversationParticipantWithRelations,
  ConversationWithRelations,
  InstantMessageWithRelations,
  TowersNotificationWithRelations,
} from "db";
import { BsChatLeftDots } from "react-icons/bs";
import { GoSidebarExpand } from "react-icons/go";
import { LuGamepad2 } from "react-icons/lu";
import { PiSignOut } from "react-icons/pi";
import { RiUserLine } from "react-icons/ri";
import { TbTower } from "react-icons/tb";
import useSWR from "swr";
import ConversationModal from "@/components/game/ConversationModal";
import SidebarMenuItem from "@/components/SidebarMenuItem";
import UserAvatar from "@/components/UserAvatar";
import { ROUTE_DELETE_ACCOUNT, ROUTE_PROFILE, ROUTE_SETTINGS, ROUTE_TOWERS } from "@/constants/routes";
import { SocketEvents } from "@/constants/socket-events";
import { GameRoomSummary, GameTableSummary, useGame } from "@/context/GameContext";
import { useModal } from "@/context/ModalContext";
import { useSocket } from "@/context/SocketContext";
import { SidebarMenuActionItem, SidebarMenuButtonItem, SidebarMenuLinkItem } from "@/interfaces/sidebar-menu";
import { authClient } from "@/lib/authClient";
import { fetcher } from "@/lib/fetcher";

export default function Sidebar(): ReactNode {
  const { i18n, t } = useLingui();
  const { openModal } = useModal();
  const { socketRef, isConnected, session } = useSocket();
  const { joinedRooms, joinedTables, activeTableId } = useGame();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isLinkTextVisible, setIsLinkTextVisible] = useState<boolean>(false);
  const [conversationsMenuItems, setConversationsMenuItems] = useState<SidebarMenuButtonItem[]>([]);
  const [gameMenuItems, setGameMenuItems] = useState<SidebarMenuLinkItem[]>([]);
  const [notifications, setNotifications] = useState<TowersNotificationWithRelations[]>([]);

  const getAccountAccordionLinks = (): SidebarMenuLinkItem[] => {
    return [
      { id: ROUTE_PROFILE.ID, label: i18n._(ROUTE_PROFILE.TITLE), href: ROUTE_PROFILE.PATH },
      { id: ROUTE_SETTINGS.ID, label: i18n._(ROUTE_SETTINGS.TITLE), href: ROUTE_SETTINGS.PATH },
      { id: ROUTE_DELETE_ACCOUNT.ID, label: i18n._(ROUTE_DELETE_ACCOUNT.TITLE), href: ROUTE_DELETE_ACCOUNT.PATH },
    ];
  };

  const {
    data: conversationsResponse,
    error: conversationsError,
    mutate: loadConversations,
    isLoading: isLoadingConversations,
  } = useSWR<ApiResponse<ConversationWithRelations[]>>("/api/conversations", fetcher, {
    revalidateOnFocus: false,
  });

  const {
    data: notificationsResponse,
    error: notificationsError,
    mutate: loadNotifications,
    isLoading: isLoadingNotifications,
  } = useSWR<ApiResponse<TowersNotificationWithRelations[]>>("/api/games/towers/notifications", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  useEffect(() => {
    Promise.all([loadConversations(), loadNotifications()]);
  }, []);

  useEffect(() => {
    if (conversationsResponse?.data) {
      setConversationsMenuItems(conversationsResponse.data.map(instantMessageMenuItem));
    }
  }, [conversationsResponse?.data]);

  useEffect(() => {
    if (notificationsResponse?.data) {
      setNotifications(notificationsResponse.data);
    }
  }, [notificationsResponse?.data]);

  useEffect(() => {
    const items: SidebarMenuLinkItem[] = joinedRooms.map((room: GameRoomSummary) => {
      const roomNotifications: TowersNotificationWithRelations[] = notifications.filter(
        (notification: TowersNotificationWithRelations) => notification.roomId === room.id,
      );

      const unreadRoomNotifications: TowersNotificationWithRelations[] = roomNotifications.filter(
        (notification: TowersNotificationWithRelations) => !notification.readAt,
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
    if (isExpanded) {
      const timer: NodeJS.Timeout = setTimeout(() => {
        setIsLinkTextVisible(true);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setIsLinkTextVisible(false);
    }
  }, [isExpanded]);

  useEffect(() => {
    if (!socketRef.current) return;

    const handleUpdateConversation = ({ conversation }: { conversation: ConversationWithRelations }): void => {
      setConversationsMenuItems((prev: SidebarMenuButtonItem[]) => {
        const existingMenuItem: SidebarMenuButtonItem | undefined = prev.find(
          (item: SidebarMenuButtonItem) => item.id === conversation.id,
        );
        const updatedMenuItem: SidebarMenuButtonItem = instantMessageMenuItem(conversation);

        return existingMenuItem
          ? prev.map((item: SidebarMenuButtonItem) => (item.id === conversation.id ? updatedMenuItem : item))
          : [...prev, updatedMenuItem];
      });
    };

    const handleUpdateConversationUneadCount = ({ conversationId }: { conversationId: string }): void => {
      setConversationsMenuItems((prev: SidebarMenuButtonItem[]) =>
        prev.map((item: SidebarMenuButtonItem) => (item.id === conversationId ? { ...item, unreadCount: 0 } : item)),
      );
    };

    const handleUpdateNotification = ({ notification }: { notification: TowersNotificationWithRelations }): void => {
      setNotifications((prev: TowersNotificationWithRelations[]) => [...prev, notification]);
    };

    socketRef.current?.on(SocketEvents.CONVERSATION_MESSAGE_SENT, handleUpdateConversation);
    socketRef.current?.on(SocketEvents.CONVERSATION_MESSAGE_MARK_AS_READ, handleUpdateConversationUneadCount);
    socketRef.current?.on(SocketEvents.TABLE_INVITATION_INVITED_NOTIFICATION, handleUpdateNotification);
    socketRef.current?.on(SocketEvents.TABLE_INVITATION_DECLINED_NOTIFICATION, handleUpdateNotification);
    socketRef.current?.on(SocketEvents.TABLE_BOOTED_NOTIFICATION, handleUpdateNotification);

    return () => {
      socketRef.current?.off(SocketEvents.CONVERSATION_MESSAGE_SENT, handleUpdateConversation);
      socketRef.current?.off(SocketEvents.CONVERSATION_MESSAGE_MARK_AS_READ, handleUpdateConversationUneadCount);
      socketRef.current?.off(SocketEvents.TABLE_INVITATION_INVITED_NOTIFICATION, handleUpdateNotification);
      socketRef.current?.off(SocketEvents.TABLE_INVITATION_DECLINED_NOTIFICATION, handleUpdateNotification);
      socketRef.current?.off(SocketEvents.TABLE_BOOTED_NOTIFICATION, handleUpdateNotification);
    };
  }, [isConnected, activeTableId]);

  const instantMessageMenuItem = (conversation: ConversationWithRelations): SidebarMenuButtonItem => {
    const currentParticipant: ConversationParticipantWithRelations | undefined = conversation.participants.find(
      (participant: ConversationParticipant) => participant.userId === session?.user.id,
    );

    const otherParticipant: ConversationParticipantWithRelations | undefined = conversation.participants.find(
      (conversationParticipant: ConversationParticipant) => conversationParticipant.userId !== session?.user.id,
    );

    const unreadMessages: InstantMessageWithRelations[] = conversation.messages.filter(
      (message: InstantMessageWithRelations) => {
        const isVisible: boolean = !message.visibleToUserId || message.visibleToUserId === session?.user.id;
        const isFromOther: boolean = message.userId !== session?.user.id;
        const isUnread: boolean =
          !currentParticipant?.readAt || new Date(message.createdAt) > new Date(currentParticipant.readAt);
        return isVisible && isFromOther && isUnread;
      },
    );

    return {
      id: conversation.id,
      label: otherParticipant?.user.username,
      unreadCount: unreadMessages.length,
      onClick: () => openModal(ConversationModal, { id: conversation.id }),
    };
  };

  const handleSignOut = async (): Promise<void> => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          socketRef.current?.emit(SocketEvents.SIGN_OUT);
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
      {/* User image and collapse icon */}
      <div className={clsx("flex items-center gap-2", isExpanded ? "w-full" : "w-auto")}>
        <div className={clsx("flex-1 flex items-center gap-4", isExpanded && "ps-2")}>
          <UserAvatar user={session?.user} />
          {isExpanded && <span className="font-medium">{session?.user.name}</span>}
        </div>
        <div className={isExpanded ? "flex" : "hidden"}>
          <button type="button" aria-label={t({ message: "Collapse sidebar" })} onClick={() => setIsExpanded(false)}>
            <GoSidebarExpand className={clsx("w-8 h-8 text-white/70", "rtl:-scale-x-100")} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Expand icon */}
      <div className={isExpanded ? "hidden" : "flex justify-center items-center w-full h-8"}>
        <button type="button" aria-label={t({ message: "Expand sidebar" })} onClick={() => setIsExpanded(true)}>
          <GoSidebarExpand
            className={clsx("w-8 h-8 text-white/70 rotate-180", "rtl:-scale-x-100")}
            aria-hidden="true"
          />
        </button>
      </div>

      <hr className="w-full border-t border-t-slate-600" />

      <nav className="flex flex-col items-center w-full" aria-label={t({ message: "User" })}>
        <SidebarMenuItem
          id="account"
          Icon={RiUserLine}
          ariaLabel={t({ message: "Account" })}
          isExpanded={isExpanded}
          isLinkTextVisible={isLinkTextVisible}
          menuItems={getAccountAccordionLinks()}
          onClick={() => setIsExpanded(true)}
        >
          {t({ message: "Account" })}
        </SidebarMenuItem>
        <SidebarMenuItem
          id="instantMessages"
          Icon={BsChatLeftDots}
          ariaLabel={t({ message: "Instant Messages" })}
          isExpanded={isExpanded}
          isLinkTextVisible={isLinkTextVisible}
          menuItems={conversationsMenuItems}
          disabled={isLoadingConversations}
          onClick={() => setIsExpanded(true)}
        >
          {t({ message: "Instant Messages" })}
        </SidebarMenuItem>
        <SidebarMenuItem
          id="rooms"
          Icon={LuGamepad2}
          ariaLabel={t({ message: "Rooms" })}
          isExpanded={isExpanded}
          isLinkTextVisible={isLinkTextVisible}
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
            isLinkTextVisible={isLinkTextVisible}
            menuItems={gameMenuItems}
            onClick={() => setIsExpanded(true)}
          >
            Towers
          </SidebarMenuItem>
        )}
      </nav>

      <hr className="w-full border-t border-t-slate-600" />

      {/* Settings and sign out button */}
      <nav
        className="self-end flex flex-col items-center w-full cursor-pointer"
        aria-label={t({ message: "Settings" })}
      >
        <SidebarMenuItem
          id="sign-out"
          Icon={PiSignOut}
          ariaLabel={t({ message: "Sign out" })}
          isExpanded={isExpanded}
          isLinkTextVisible={isLinkTextVisible}
          onClick={handleSignOut}
        >
          {t({ message: "Sign out" })}
        </SidebarMenuItem>
      </nav>
    </aside>
  );
}
