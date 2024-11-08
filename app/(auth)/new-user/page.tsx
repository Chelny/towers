import { ReactNode } from "react"
import { NextResponse } from "next/server"
import { Metadata } from "next/types"
import { IUserProfile } from "@prisma/client"
import { ProfileForm } from "@/app/(protected)/account/profile/profile.form"
import { GET } from "@/app/api/account/profile/route"
import Anchor from "@/components/ui/Anchor"
import { ROUTE_GAMES, ROUTE_NEW_USER } from "@/constants/routes"

export const metadata: Metadata = {
  title: ROUTE_NEW_USER.TITLE,
}

export default async function NewUserPage(): Promise<ReactNode> {
  const response: NextResponse = await GET()
  const result = await response.json()
  const user: IUserProfile = result.data

  return (
    <>
      <h2 className="mb-4 text-3xl">{ROUTE_NEW_USER.TITLE}</h2>
      <ProfileForm user={user} isNewUser />
      <div className="mt-4 text-center">
        <Anchor href={ROUTE_GAMES.PATH}>Skip this step</Anchor>
      </div>
    </>
  )
}
