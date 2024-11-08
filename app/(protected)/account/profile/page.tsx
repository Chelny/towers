import { ReactNode } from "react"
import { Metadata } from "next"
import { NextResponse } from "next/server"
import { IUserProfile } from "@prisma/client"
import { ProfileForm } from "@/app/(protected)/account/profile/profile.form"
import { GET } from "@/app/api/account/profile/route"
import { ROUTE_PROFILE } from "@/constants/routes"

export const metadata: Metadata = {
  title: ROUTE_PROFILE.TITLE,
}

export default async function Profile(): Promise<ReactNode> {
  const response: NextResponse = await GET()
  const result = await response.json()
  const user: IUserProfile = result.data

  return (
    <>
      <h2 className="mb-4 text-3xl">{ROUTE_PROFILE.TITLE}</h2>
      <ProfileForm user={user} />
    </>
  )
}
