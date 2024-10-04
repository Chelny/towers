"use client"

import { ReactNode } from "react"
import Image from "next/image"
import { useSessionData } from "@/hooks/useSessionData"

export default function UserAvatar(): ReactNode {
  const { data: session, status } = useSessionData()

  if (!session || status === "loading") {
    return (
      <div className="w-10 h-10 rounded-md bg-zinc-400">
        <Image
          className="rounded-md"
          src="https://placehold.co/40x40.png?text=?"
          width={40}
          height={40}
          priority
          alt="User avatar placeholder"
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
        alt={session?.user?.image ? `${session?.user?.username}’s avatar` : "User avatar placeholder"}
      />
    </div>
  )
}
