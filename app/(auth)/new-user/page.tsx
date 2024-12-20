import { ReactNode } from "react"
import { headers } from "next/headers"
import { Metadata } from "next/types"
import { ProfileForm } from "@/app/(protected)/account/profile/profile.form"
import Anchor from "@/components/ui/Anchor"
import { ROUTE_GAMES, ROUTE_NEW_USER } from "@/constants/routes"
import { auth } from "@/lib/auth"
import { Session } from "@/lib/auth-client"

export const metadata: Metadata = {
  title: ROUTE_NEW_USER.TITLE,
}

export default async function NewUserPage(): Promise<ReactNode> {
  const session: Session | null = await auth.api.getSession({ headers: await headers() })

  return (
    <>
      <h2 className="mb-4 text-3xl">{ROUTE_NEW_USER.TITLE}</h2>
      <ProfileForm session={session} />
      <div className="mt-4 text-center">
        <Anchor href={ROUTE_GAMES.PATH}>Skip this step</Anchor>
      </div>
    </>
  )
}
