"use client"

import { ReactNode } from "react"
import Image from "next/image"
import { useSessionData } from "@/hooks"

export default function UserAvatar(): ReactNode {
  const { data: session, status } = useSessionData()

  if (!session?.user || status === "loading") {
    return <div className="w-10 h-10 rounded bg-zinc-400"></div>
  }

  return (
    <div className="w-10 h-10 rounded bg-zinc-400">
      <Image
        src={session?.user?.image ?? "https://picsum.photos/id/91/40/40"}
        width={40}
        height={40}
        alt="User Avatar"
      />
    </div>
  )
}
