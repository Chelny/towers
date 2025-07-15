"use client"

import { ReactNode, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Trans, useLingui } from "@lingui/react/macro"
import clsx from "clsx/lite"
import { GoSidebarExpand } from "react-icons/go"
import { LuGamepad2 } from "react-icons/lu"
import { PiSignOut } from "react-icons/pi"
import { RiUserLine } from "react-icons/ri"
import { TbTower } from "react-icons/tb"
import AlertModal from "@/components/game/AlertModal"
import InstantMessageModal from "@/components/game/InstantMessageModal"
import TableInvitationModal from "@/components/game/TableInvitationModal"
import SidebarMenuItem from "@/components/SidebarMenuItem"
import UserAvatar from "@/components/UserAvatar"
import { ROUTE_DELETE_ACCOUNT, ROUTE_HOME, ROUTE_PROFILE, ROUTE_SETTINGS, ROUTE_TOWERS } from "@/constants/routes"
import {
  GameInstantMessage,
  GameNotification,
  GameRoomSummary,
  GameTableBootedMessage,
  GameTableInvitation,
  GameTableSummary,
  useGame,
} from "@/context/GameContext"
import { useModal } from "@/context/ModalContext"
import { useSocket } from "@/context/SocketContext"
import { SidebarMenuActionItem, SidebarMenuDropdownItem, SidebarMenuLinkItem } from "@/interfaces/sidebar-menu"
import { authClient } from "@/lib/auth-client"

export default function Sidebar(): ReactNode {
  const router = useRouter()
  const { session } = useSocket()
  const { joinedRooms, joinedTables, notifications } = useGame()
  const { openModal, closeModal } = useModal()
  const { i18n, t } = useLingui()
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const [isLinkTextVisible, setIsLinkTextVisible] = useState<boolean>(false)

  const gameMenuItems: SidebarMenuLinkItem[] = joinedRooms.map((room: GameRoomSummary) => {
    // Room Notifications
    const roomNotifications: GameNotification[] = notifications[room.id] ?? []
    const notificationItems: SidebarMenuDropdownItem[] = roomNotifications.map<SidebarMenuDropdownItem>(
      (notification: GameNotification) => {
        // Instant message notification
        if (notification.type === "instantMessage") {
          const instantMessage: GameInstantMessage = notification as Extract<
            GameNotification,
            { type: "instantMessage" }
          >
          return {
            id: `instant-message-${instantMessage.id}`,
            roomId: notification.roomId,
            notification,
            label: i18n._("Instant message #{id} from {sender}", {
              id: instantMessage.id.slice(0, 4),
              sender: instantMessage.sender.user?.username,
            }),
            onClick: () => openModal(InstantMessageModal, { instantMessage }),
          }
        } else if (notification.type === "tableBootedMessage") {
          const tableBootedMessage: GameTableBootedMessage = notification as Extract<
            GameNotification,
            { type: "tableBootedMessage" }
          >
          return {
            id: `table-booted-message-${tableBootedMessage.id}`,
            roomId: notification.roomId,
            label: t({ message: "You have been booted from a table." }),
            notification,
            onClick: () =>
              openModal(AlertModal, {
                title: t({ message: "Booted from table" }),
                message: i18n._("You have been booted from table #{tableNumber} by {host}.", {
                  tableNumber: tableBootedMessage.tableNumber,
                  host: tableBootedMessage.hostUsername,
                }),
                testId: "booted-user",
              }),
          }
        }

        // Table invitation
        const tableInvitation: GameTableInvitation = notification as Extract<
          GameNotification,
          { type: "tableInvitation" }
        >
        const base: SidebarMenuDropdownItem = {
          id: `table-invitation-${tableInvitation.id}`,
          roomId: notification.roomId,
          notification,
        } as SidebarMenuDropdownItem

        return {
          ...base,
          label: i18n._("Invitation to table #{tableNumber}", {
            tableNumber: tableInvitation.tableNumber,
          }),
          onClick: () =>
            openModal(TableInvitationModal, {
              tableInvitation: tableInvitation,
              onAcceptInvitation: (roomId: string, tableId: string) => {
                router.push(`${ROUTE_TOWERS.PATH}?room=${roomId}&table=${tableId}`)
                closeModal()
              },
            }),
        }
      },
    )

    // Tables
    const tables: SidebarMenuLinkItem[] = joinedTables
      .filter((table: GameTableSummary) => table.roomId === room.id)
      .map((table: GameTableSummary) => ({
        id: `table-${table.id}`,
        label: i18n._("Table #{tableNumber}", { tableNumber: table.tableNumber }),
        href: `${room.basePath}?room=${room.id}&table=${table.id}`,
      }))

    return {
      id: `room-${room.id}`,
      label: room.name,
      href: `${room.basePath}?room=${room.id}`,
      children: [
        ...(notifications
          ? [
              {
                id: `notifications-${room.id}`,
                label: t({ message: "Notifications" }),
                children: notificationItems,
                unreadCount: notificationItems.filter(
                  (n: SidebarMenuDropdownItem) => n.notification.status === "unread",
                ).length,
              } satisfies SidebarMenuActionItem,
            ]
          : []),
        ...tables,
      ],
    }
  })

  useEffect(() => {
    if (isExpanded) {
      const timer: NodeJS.Timeout = setTimeout(() => {
        setIsLinkTextVisible(true)
      }, 300)

      return () => clearTimeout(timer)
    } else {
      setIsLinkTextVisible(false)
    }
  }, [isExpanded])

  const getAccountAccordionLinks = (): SidebarMenuLinkItem[] => {
    return [
      { id: ROUTE_PROFILE.ID, href: ROUTE_PROFILE.PATH, label: i18n._(ROUTE_PROFILE.TITLE) },
      { id: ROUTE_SETTINGS.ID, href: ROUTE_SETTINGS.PATH, label: i18n._(ROUTE_SETTINGS.TITLE) },
      { id: ROUTE_DELETE_ACCOUNT.ID, href: ROUTE_DELETE_ACCOUNT.PATH, label: i18n._(ROUTE_DELETE_ACCOUNT.TITLE) },
    ]
  }

  const handleSignOut = async (): Promise<void> => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push(ROUTE_HOME.PATH)
        },
      },
    })
  }

  return (
    <aside
      className={clsx(
        "shrink-0 flex flex-col gap-4 min-w-24 h-full px-2 py-4 border-e border-e-gray-700 shadow-xl bg-gray-800 text-white/90 transition transition-[width] duration-500 ease-in-out",
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
          <Trans>Account</Trans>
        </SidebarMenuItem>
        <SidebarMenuItem
          id="rooms"
          Icon={LuGamepad2}
          ariaLabel={t({ message: "Rooms" })}
          isExpanded={isExpanded}
          isLinkTextVisible={isLinkTextVisible}
          href={ROUTE_TOWERS.PATH}
          disabled
        >
          <Trans>Rooms</Trans>
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
          <Trans>Sign out</Trans>
        </SidebarMenuItem>
      </nav>
    </aside>
  )
}
