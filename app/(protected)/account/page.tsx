import { ReactNode } from "react"
import Link from "next/link"
import clsx from "clsx/lite"
import { PiArrowFatRightDuotone } from "react-icons/pi"
import { AccountForm } from "@/app/(protected)/account/account.form"
import { ROUTE_PROFILE, ROUTE_UPDATE_PASSWORD } from "@/constants"

export default function Account(): ReactNode {
  return (
    <ul
      className={clsx(
        "flex flex-col gap-2",
        "*:flex *:justify-between *:items-center *:px-2 *:py-3 *:rounded-sm *:bg-gray-100"
      )}
    >
      <li className="group">
        <Link className="flex justify-between items-center w-full" href={ROUTE_PROFILE.PATH}>
          <span className={clsx("text-blue-500", "group-hover:underline")}>{ROUTE_PROFILE.TITLE}</span>
          <PiArrowFatRightDuotone className={clsx("group-hover:text-gray-500")} />
        </Link>
      </li>
      <li className="group">
        <Link className="flex justify-between items-center w-full" href={ROUTE_UPDATE_PASSWORD.PATH}>
          <span className={clsx("text-blue-500", "group-hover:underline")}>{ROUTE_UPDATE_PASSWORD.TITLE}</span>
          <PiArrowFatRightDuotone className={clsx("group-hover:text-gray-500")} />
        </Link>
      </li>
      <li className={clsx("group", "hover:cursor-pointer")}>
        <AccountForm />
      </li>
    </ul>
  )
}
