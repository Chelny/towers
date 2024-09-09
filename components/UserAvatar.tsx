"use client"

import { ReactNode } from "react"
import Image from "next/image"
import { useSessionData } from "@/hooks"

export default function UserAvatar(): ReactNode {
  const { data: session, status } = useSessionData()

  if (!session?.user || status === "loading") {
    return (
      <div className="w-10 h-10 rounded bg-zinc-400">
        <Image src="https://placehold.co/40x40.png?text=?" width={40} height={40} alt="User avatar placeholder" />
      </div>
    )
  }

  return (
    <div className="w-10 h-10 rounded bg-zinc-400">
      <Image
        src={session?.user?.image ?? "https://placehold.co/40x40.png?text=?"}
        width={40}
        height={40}
        alt={session?.user?.image ? `${session?.user?.username}'s avatar` : "User avatar placeholder"}
      />
    </div>
  )
}
