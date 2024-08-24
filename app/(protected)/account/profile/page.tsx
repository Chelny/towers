import { ReactNode } from "react"
import { Metadata } from "next"
import { NextResponse } from "next/server"
import { Account, User } from "@prisma/client"
import { ProfileForm } from "@/app/(protected)/account/profile/profile.form"
import { GET } from "@/app/api/account/profile/route"
import { ROUTE_PROFILE } from "@/constants"

export const metadata: Metadata = {
  title: ROUTE_PROFILE.TITLE
}

export default async function Profile(): Promise<ReactNode> {
  const response: NextResponse = await GET()
  const data = await response.json()
  const user: (Partial<User> & { accounts: Partial<Account>[] }) | null = data.data

  return (
    <>
      <h2 className="my-8 text-4xl">{ROUTE_PROFILE.TITLE}</h2>
      <ProfileForm user={user} />
    </>
  )
}
