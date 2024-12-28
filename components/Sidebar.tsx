"use client"

import { ReactNode, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Trans, useLingui } from "@lingui/react/macro"
import clsx from "clsx/lite"
import { useTheme } from "next-themes"
import { LuGamepad2 } from "react-icons/lu"
import { LuMoon, LuSun } from "react-icons/lu"
import { PiSignOut } from "react-icons/pi"
import { RiUserLine } from "react-icons/ri"
import { TbSquareChevronLeft, TbSquareChevronRight } from "react-icons/tb"
import { TbTower } from "react-icons/tb"
import { useDispatch } from "react-redux"
import SidebarMenuItem, { AccordionLink } from "@/components/SidebarMenuItem"
import UserAvatar from "@/components/UserAvatar"
import { ROUTE_DELETE_ACCOUNT, ROUTE_HOME, ROUTE_PROFILE, ROUTE_SETTINGS, ROUTE_TOWERS } from "@/constants/routes"
import { authClient } from "@/lib/auth-client"
import { useAppSelector } from "@/lib/hooks"
import { destroySocket } from "@/redux/features/socket-slice"
import { RootState } from "@/redux/store"

export default function Sidebar(): ReactNode {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const [isLinkTextVisible, setIsLinkTextVisible] = useState<boolean>(false)
  const { data: session, isPending } = authClient.useSession()
  const dispatch = useDispatch()
  const gameAccordionLinks: AccordionLink[] = useAppSelector((state: RootState) => state.sidebar?.gameLinks)
  const { i18n, t } = useLingui()
  const { theme, setTheme } = useTheme()
  const [isSystemDarkMode, setIsSystemDarkMode] = useState<boolean>(false)

  const getAccountAccordionLinks = (): AccordionLink[] => {
    return [
      { href: ROUTE_PROFILE.PATH, label: i18n._(ROUTE_PROFILE.TITLE) },
      { href: ROUTE_SETTINGS.PATH, label: i18n._(ROUTE_SETTINGS.TITLE) },
      { href: ROUTE_DELETE_ACCOUNT.PATH, label: i18n._(ROUTE_DELETE_ACCOUNT.TITLE) },
    ]
  }

  const handleSignOut = async (): Promise<void> => {
    dispatch(destroySocket())
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push(ROUTE_HOME.PATH)
        },
      },
    })
  }

  const handleToggleTheme = (): void => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

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

  useEffect(() => {
    if (theme === "system") {
      const mediaQuery: MediaQueryList = window.matchMedia("(prefers-color-scheme: dark)")

      setIsSystemDarkMode(mediaQuery.matches)

      const listener = (event: MediaQueryListEvent) => {
        setIsSystemDarkMode(event.matches)
      }

      mediaQuery.addEventListener("change", listener)

      return () => mediaQuery.removeEventListener("change", listener)
    }
  }, [theme])

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
          <button type="button" aria-label={t({ message: "Collapse sidebar" })} onClick={() => setIsExpanded(false)}>
            <TbSquareChevronLeft className={clsx("w-8 h-8 text-white/70", "rtl:rotate-180")} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Expand icon */}
      <div className={isExpanded ? "hidden" : "flex justify-center items-center w-full h-8"}>
        <button type="button" aria-label={t({ message: "Expand sidebar" })} onClick={() => setIsExpanded(true)}>
          <TbSquareChevronRight className={clsx("w-8 h-8 text-white/70", "rtl:rotate-180")} aria-hidden="true" />
        </button>
      </div>

      <hr className="w-full border-t border-t-slate-600" />

      <nav className="flex flex-col items-center w-full" aria-label={t({ message: "User" })}>
        <SidebarMenuItem
          Icon={LuGamepad2}
          ariaLabel={t({ message: "Rooms" })}
          isExpanded={isExpanded}
          isLinkTextVisible={isLinkTextVisible}
          href={ROUTE_TOWERS.PATH}
          disabled
        >
          <Trans>Rooms</Trans>
        </SidebarMenuItem>
        <SidebarMenuItem
          Icon={RiUserLine}
          ariaLabel={t({ message: "Account" })}
          isExpanded={isExpanded}
          isLinkTextVisible={isLinkTextVisible}
          accordionLinks={getAccountAccordionLinks()}
          disabled={isPending}
          onClick={() => setIsExpanded(true)}
        >
          <Trans>Account</Trans>
        </SidebarMenuItem>
      </nav>

      <hr className="w-full border-t border-t-slate-600" />

      {/* Games */}
      <nav className="flex-1 flex flex-col items-center w-full" aria-label={t({ message: "Games" })}>
        {gameAccordionLinks?.length > 0 && (
          <SidebarMenuItem
            Icon={TbTower}
            ariaLabel={t({ message: "Games" })}
            isExpanded={isExpanded}
            isLinkTextVisible={isLinkTextVisible}
            accordionLinks={gameAccordionLinks}
            disabled={isPending}
            onClick={() => setIsExpanded(true)}
          >
            Towers
          </SidebarMenuItem>
        )}
      </nav>

      <hr className="w-full border-t border-t-slate-600" />

      {/* Settings and sign out button */}
      <nav className="self-end flex flex-col items-center w-full" aria-label={t({ message: "Settings" })}>
        {/* FIXME: Hydration issue */}
        {/* <SidebarMenuItem
          Icon={theme === "system"
            ? isSystemDarkMode ? LuSun : LuMoon
            : theme === "dark" ? LuSun : LuMoon
          }
          ariaLabel={theme === "dark" ? t({ message: "Toggle to Light Mode" }) : t({ message: "Toggle to Dark Mode" })}
          isExpanded={isExpanded}
          isLinkTextVisible={isLinkTextVisible}
          disabled
          onClick={handleToggleTheme}
        >
          {theme === "dark" ? <Trans>Light Mode</Trans> : <Trans>Dark Mode</Trans>}
        </SidebarMenuItem> */}
        <SidebarMenuItem
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
