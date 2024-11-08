"use client"

import { ReactNode, useEffect, useState } from "react"
import clsx from "clsx/lite"
import { signOut } from "next-auth/react"
import { IoLanguage } from "react-icons/io5"
import { LuGamepad2 } from "react-icons/lu"
import { PiSignOut } from "react-icons/pi"
import { RiUserLine } from "react-icons/ri"
import { TbSquareChevronLeft, TbSquareChevronRight } from "react-icons/tb"
import { TbTower } from "react-icons/tb"
import { useDispatch } from "react-redux"
import SidebarMenuItem, { AccordionLink } from "@/components/SidebarMenuItem"
import UserAvatar from "@/components/UserAvatar"
import { ROUTE_CANCEL_ACCOUNT, ROUTE_PROFILE, ROUTE_TOWERS, ROUTE_UPDATE_PASSWORD } from "@/constants/routes"
import { useSessionData } from "@/hooks/useSessionData"
import { useAppSelector } from "@/lib/hooks"
import { destroySocket } from "@/redux/features/socket-slice"
import { RootState } from "@/redux/store"

export default function Sidebar(): ReactNode {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const [isLinkTextVisible, setIsLinkTextVisible] = useState<boolean>(false)
  const { data: session, status } = useSessionData()
  const dispatch = useDispatch()
  const gameAccordionLinks: AccordionLink[] = useAppSelector((state: RootState) => state.sidebar.gameLinks)

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

  const getAccountAccordionLinks = (): AccordionLink[] => {
    const links: AccordionLink[] = [{ href: ROUTE_PROFILE.PATH, label: ROUTE_PROFILE.TITLE }]

    if (session?.account) {
      links.push({ href: ROUTE_UPDATE_PASSWORD.PATH, label: ROUTE_UPDATE_PASSWORD.TITLE })
    }

    links.push({ href: ROUTE_CANCEL_ACCOUNT.PATH, label: ROUTE_CANCEL_ACCOUNT.TITLE })

    return links
  }

  const handleSignOut = (): void => {
    dispatch(destroySocket())
    signOut()
  }

  return (
    <aside
      className={clsx(
        "flex-shrink-0 flex flex-col gap-4 min-w-24 h-full px-2 py-4 border-e border-e-gray-300 shadow-lg bg-gray-800 text-white/90 transition transition-[width] duration-500 ease-in-out",
        isExpanded ? "w-72 items-start" : "w-24 items-center",
      )}
    >
      {/* User image and collapse icon */}
      <div className={clsx("flex items-center gap-2", isExpanded ? "w-full" : "w-auto")}>
        <div className={clsx("flex-1 flex items-center gap-4", isExpanded && "ps-2")}>
          <UserAvatar />
          {isExpanded && <span className="font-medium">{session?.user.name}</span>}
        </div>
        <div className={isExpanded ? "flex" : "hidden"}>
          <button type="button" aria-label="Collapse sidebar" onClick={() => setIsExpanded(false)}>
            <TbSquareChevronLeft className="w-8 h-8 text-white/70" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Expand icon */}
      <div className={isExpanded ? "hidden" : "flex justify-center items-center w-full h-8"}>
        <button type="button" aria-label="Expand sidebar" onClick={() => setIsExpanded(true)}>
          <TbSquareChevronRight className="w-8 h-8 text-white/70" aria-hidden="true" />
        </button>
      </div>

      <hr className="w-full border-t border-t-slate-600" />

      <nav className="flex flex-col items-center w-full" aria-label="User">
        <SidebarMenuItem
          Icon={LuGamepad2}
          ariaLabel="Rooms"
          isExpanded={isExpanded}
          isLinkTextVisible={isLinkTextVisible}
          href={ROUTE_TOWERS.PATH}
          disabled
        >
          Rooms
        </SidebarMenuItem>
        <SidebarMenuItem
          Icon={RiUserLine}
          ariaLabel="Account"
          isExpanded={isExpanded}
          isLinkTextVisible={isLinkTextVisible}
          accordionLinks={getAccountAccordionLinks()}
          disabled={status === "loading"}
          onClick={() => setIsExpanded(true)}
        >
          Account
        </SidebarMenuItem>
      </nav>

      <hr className="w-full border-t border-t-slate-600" />

      {/* Games */}
      <nav className="flex-1 flex flex-col items-center w-full" aria-label="Games">
        {gameAccordionLinks?.length > 0 && (
          <SidebarMenuItem
            Icon={TbTower}
            ariaLabel="Games"
            isExpanded={isExpanded}
            isLinkTextVisible={isLinkTextVisible}
            accordionLinks={gameAccordionLinks}
            disabled={status === "loading"}
            onClick={() => setIsExpanded(true)}
          >
            Towers
          </SidebarMenuItem>
        )}
      </nav>

      <hr className="w-full border-t border-t-slate-600" />

      {/* Settings and sign out button */}
      <nav className="self-end flex flex-col items-center w-full" aria-label="Settings">
        <SidebarMenuItem
          Icon={IoLanguage}
          ariaLabel="Set language"
          isExpanded={isExpanded}
          isLinkTextVisible={isLinkTextVisible}
          disabled
        >
          English
        </SidebarMenuItem>
        <SidebarMenuItem
          Icon={PiSignOut}
          ariaLabel="Sign out"
          isExpanded={isExpanded}
          isLinkTextVisible={isLinkTextVisible}
          onClick={handleSignOut}
        >
          Sign out
        </SidebarMenuItem>
      </nav>
    </aside>
  )
}
