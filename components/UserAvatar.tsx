"use client"

import { ReactNode } from "react"
import Image from "next/image"
import { Trans, useLingui } from "@lingui/react/macro"
import { authClient } from "@/lib/auth-client"

export default function UserAvatar(): ReactNode {
  const { data: session, isPending } = authClient.useSession()
  const { t } = useLingui()
  const username: string | undefined = session?.user.username

  if (!session || isPending) {
    return (
      <div className="w-10 h-10 rounded-md bg-zinc-400">
        <Image
          className="rounded-md"
          src="https://placehold.co/40x40.png?text=?"
          width={40}
          height={40}
          priority
          alt={t({ message: "Avatar placeholder" })}
        />
      </div>
    )
  }

  return (
    <div className="w-10 h-10 rounded-md bg-zinc-400">
      <Image
        className="rounded-md"
        src={session?.user?.image ?? "https://placehold.co/40x40.png?text=?"}
        width={40}
        height={40}
        priority
        alt={session?.user?.image ? t({ message: `${username}’s avatar` }) : t({ message: "Avatar placeholder" })}
      />
    </div>
  )
}
