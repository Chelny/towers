import { NextResponse } from "next/server"
import { Account, User, UserStatus } from "@prisma/client"
import { Session } from "next-auth"
import { AccountData } from "@/app/(protected)/account/account.actions"
import { auth } from "@/auth"
import { getAccountsByUserId, getUserById } from "@/data"
import { sendAccountDeletionEmail } from "@/lib"
import prisma from "@/lib/prisma"

export async function DELETE(body: AccountData): Promise<NextResponse> {
  const session: Session | null = await auth()

  if (!session?.user) {
    return NextResponse.json(
      {
        success: false,
        message: "Please sign in to access your account."
      },
      { status: 401 }
    )
  }

  const user: User | null = await getUserById(session.user.id)

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        message: "We couldn’t find an account with that information. Please check your details and try again."
      },
      { status: 404 }
    )
  }

  if (body.email !== user.email) {
    return NextResponse.json(
      {
        success: false,
        message: "The email provided does not match our records. Please try again."
      },
      { status: 400 }
    )
  }

  // Success message
  let successMessage: string =
    "Your account deletion request has been accepted. Your account will be permanently deleted after 30 days."

  const accounts: Account[] = await getAccountsByUserId(session.user.id)

  if (accounts.length > 0) {
    successMessage +=
      " Please ensure to remove our application from your third-party account settings to fully disconnect your account."
  }

  successMessage += " You will be redirected to the sign in page in 15 seconds..."

  // Set account deletion date + send email to user
  const deletionDate: Date = new Date()
  deletionDate.setDate(deletionDate.getDate() + 30)

  const updatedUser: Pick<User, "name" | "email" | "deletionScheduledAt"> = await prisma.user.update({
    where: {
      id: session.user.id
    },
    data: {
      status: UserStatus.PENDING_DELETION,
      deletionScheduledAt: deletionDate
    },
    select: {
      name: true,
      email: true,
      deletionScheduledAt: true
    }
  })

  await sendAccountDeletionEmail(updatedUser)

  return NextResponse.json(
    {
      success: true,
      message: successMessage
    },
    { status: 202 }
  )
}
