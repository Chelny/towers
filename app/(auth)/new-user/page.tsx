import { ReactNode } from "react"
import Link from "next/link"
import { NextResponse } from "next/server"
import { Metadata } from "next/types"
import { Account, User } from "@prisma/client"
import { ProfileForm } from "@/app/(protected)/account/profile/profile.form"
import { GET } from "@/app/api/account/profile/route"
import { ROUTE_HOME, ROUTE_NEW_USER } from "@/constants/routes"

export const metadata: Metadata = {
  title: ROUTE_NEW_USER.TITLE
}

export default async function NewUserPage(): Promise<ReactNode> {
  const response: NextResponse = await GET()
  const data = await response.json()
  const user: (Partial<User> & { accounts: Partial<Account>[] }) | null = data.data

  return (
    <>
      <h2 className="mb-4 text-3xl">{ROUTE_NEW_USER.TITLE}</h2>
      <ProfileForm user={user} isNewUser />
      <div className="mt-4 text-center">
        <Link className="text-blue-500 hover:underline" href={ROUTE_HOME.PATH}>
          Skip this step
        </Link>
      </div>
    </>
  )
}
