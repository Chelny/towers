"use client"

import { ReactNode, useEffect, useState } from "react"
import Link from "next/link"
import clsx from "clsx/lite"
import { signOut } from "next-auth/react"
import { FiMoon, FiSun } from "react-icons/fi"
import { IoLanguage } from "react-icons/io5"
import { LiaUsersSolid } from "react-icons/lia"
import { LuGamepad2 } from "react-icons/lu"
import { PiSignOut } from "react-icons/pi"
import { RiExpandLeftLine, RiExpandRightLine } from "react-icons/ri"
import { useDispatch } from "react-redux"
import UserAvatar from "@/components/UserAvatar"
import { ROUTE_ACCOUNT, ROUTE_TOWERS } from "@/constants"
import { destroySocket } from "@/features"
import { useSessionData } from "@/hooks"

export default function RoomSidebar(): ReactNode {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const [showText, setShowText] = useState<boolean>(false)
  const { data: session } = useSessionData()
  const dispatch = useDispatch()

  useEffect(() => {
    if (isExpanded) {
      const timer: NodeJS.Timeout = setTimeout(() => {
        setShowText(true)
      }, 300)

      return () => clearTimeout(timer)
    } else {
      setShowText(false)
    }
  }, [isExpanded])

  const handleSignOut = (): void => {
    dispatch(destroySocket())
    signOut()
  }

  return (
    <aside
      className={clsx(
        "flex-shrink-0 flex flex-col gap-4 min-w-24 h-full p-4 bg-gray-800 text-white transition transition-[width] duration-500 ease-in-out",
        isExpanded ? "w-72 items-start" : "w-24 items-center"
      )}
    >
      {/* Expand icon */}
      <div className={isExpanded ? "hidden" : "flex justify-center items-center w-full h-8"}>
        <button type="button" aria-label="Expand sidebar" onClick={() => setIsExpanded(true)}>
          <RiExpandRightLine className="w-8 h-8" aria-hidden="true" />
        </button>
      </div>

      {/* User image + collapse icon */}
      <div className={clsx("flex items-center gap-2", isExpanded ? "w-full" : "w-auto")}>
        <Link className="flex-1 flex items-center gap-2" href={ROUTE_ACCOUNT.PATH}>
          <UserAvatar />
          {isExpanded && <span>{session?.user.username}</span>}
        </Link>
        <div className={isExpanded ? "flex" : "hidden"}>
          <button type="button" aria-label="Collapse sidebar" onClick={() => setIsExpanded(false)}>
            <RiExpandLeftLine className="w-8 h-8" aria-hidden="true" />
          </button>
        </div>
      </div>

      <hr className="w-full border-t border-t-slate-500" />

      {/* Joined rooms and tables */}
      <div className="flex-1 flex flex-col items-center gap-2 w-full">
        {/* <Link
          className={clsx(
            "flex items-center gap-2 px-1 py-2 rounded",
            isExpanded ? "w-full" : "w-auto",
            "hover:bg-gray-600"
          )}
          href={`${ROUTE_TOWERS.PATH}?room=${1}`}
        >
          <LiaUsersSolid className="w-8 h-8" aria-hidden="true" />
          <span
            className={clsx(
              "transition-opacity duration-300",
              isExpanded ? "block" : "hidden",
              showText ? "opacity-100" : "opacity-0"
            )}
          >
            Empire State Building
          </span>
        </Link> */}
        {/* <Link
          className={clsx(
            "flex items-center gap-2 px-1 py-2 rounded",
            isExpanded ? "w-full" : "w-auto",
            "hover:bg-gray-600"
          )}
          href={`${ROUTE_TOWERS.PATH}?room=${1}&table=${1}`}
        >
          <LuGamepad2 className="w-8 h-8" aria-hidden="true" />
          <span
            className={clsx(
              "transition-opacity duration-300",
              isExpanded ? "block" : "hidden",
              showText ? "opacity-100" : "opacity-0"
            )}
          >
            Empire State Building - Table 1
          </span>
        </Link> */}
      </div>

      <hr className="w-full border-t border-t-slate-500" />

      {/* Application settings and sign out button */}
      <div className="self-end flex flex-col items-center gap-2 w-full">
        <div
          className={clsx(
            "px-1 py-2 rounded",
            isExpanded ? "w-full" : "w-auto",
            "has-[button:not(:disabled)]:hover:bg-gray-600"
          )}
        >
          <button
            type="button"
            className={clsx("flex items-center gap-2 w-full", "disabled:opacity-50 disabled:cursor-not-allowed")}
            disabled
            aria-label="Set language"
          >
            <IoLanguage className="w-7 h-7" aria-hidden="true" />
            <span
              className={clsx(
                "transition-opacity duration-300",
                isExpanded ? "block" : "hidden",
                showText ? "opacity-100" : "opacity-0"
              )}
            >
              English
            </span>
          </button>
        </div>
        <div
          className={clsx(
            "px-1 py-2 rounded",
            isExpanded ? "w-full" : "w-auto",
            "has-[button:not(:disabled)]:hover:bg-gray-600"
          )}
        >
          <button
            type="button"
            className={clsx("flex items-center gap-2 w-full", "disabled:opacity-50 disabled:cursor-not-allowed")}
            disabled
            aria-label="Toggle theme"
          >
            <FiMoon className="w-7 h-7" aria-hidden="true" />
            {/* <FiSun className="w-7 h-7" aria-hidden="true" /> */}
            <span
              className={clsx(
                "transition-opacity duration-300",
                isExpanded ? "block" : "hidden",
                showText ? "opacity-100" : "opacity-0"
              )}
            >
              Switch to dark
            </span>
          </button>
        </div>
        <div
          className={clsx(
            "px-1 py-2 rounded",
            isExpanded ? "w-full" : "w-auto",
            "has-[button:not(:disabled)]:hover:bg-gray-600"
          )}
        >
          <button
            className="flex items-center gap-2 w-full"
            type="button"
            aria-label="Sign out"
            onClick={handleSignOut}
          >
            <PiSignOut className="w-7 h-7" aria-hidden="true" />
            <span
              className={clsx(
                "transition-opacity duration-300",
                isExpanded ? "block" : "hidden",
                showText ? "opacity-100" : "opacity-0"
              )}
            >
              Sign out
            </span>
          </button>
        </div>
      </div>
    </aside>
  )
}
