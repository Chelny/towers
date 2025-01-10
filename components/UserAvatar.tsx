"use client"

import { ReactNode } from "react"
import Image from "next/image"
import { useLingui } from "@lingui/react/macro"
import clsx from "clsx/lite"
import { Session } from "@/lib/auth-client"

type UserAvatarProps = {
  user: Session["user"] | undefined | null
  isLoading?: boolean
  className?: string
  size?: number
}

export default function UserAvatar({ user, isLoading, className, size = 40 }: UserAvatarProps): ReactNode {
  const { t } = useLingui()
  const username: string | undefined = user?.username

  if (isLoading || !user) {
    return (
      <div className={clsx("flex w-10 h-10 rounded-md bg-zinc-400", className)}>
        <Image
          className="rounded-md"
          src="https://placehold.co/40x40.png?text=?"
          width={size}
          height={size}
          priority
          alt={t({ message: "Avatar placeholder" })}
        />
      </div>
    )
  }

  return (
    <div className={clsx("flex w-10 h-10 rounded-md bg-zinc-400", className)}>
      <Image
        className="rounded-md"
        src={user?.image ?? "https://placehold.co/40x40.png?text=?"}
        width={size}
        height={size}
        priority
        alt={user?.image ? t({ message: `${username}’s avatar` }) : t({ message: "Avatar placeholder" })}
      />
    </div>
  )
}
