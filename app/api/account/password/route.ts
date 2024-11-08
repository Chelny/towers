import { NextRequest, NextResponse } from "next/server"
import { User } from "@prisma/client"
import { compareSync, hashSync } from "bcrypt-edge"
import { Session } from "next-auth"
import { UpdatePasswordPayload } from "@/app/(protected)/account/update-password/update-password.schema"
import { auth } from "@/auth"
import { getAccountsByUserId } from "@/data/account"
import { getUserById } from "@/data/user"
import { getPrismaError, unauthorized } from "@/lib/api"
import prisma from "@/lib/prisma"

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const body: UpdatePasswordPayload = await request.json()

  const session: Session | null = await auth()
  if (!session) return unauthorized()

  try {
    const user: User | null = await getUserById(session.user.id)

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "We couldn’t find an account with that information. Please check your details and try again.",
        },
        { status: 404 },
      )
    }

    const accounts = await getAccountsByUserId(session.user.id)

    if (accounts.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "You cannot set a password as you are logged in using a third-party account.",
        },
        { status: 401 },
      )
    }

    let hashedPassword

    if (body.currentPassword && user.password) {
      const isPasswordsMatch: boolean = compareSync(body.currentPassword, user.password)
      if (!isPasswordsMatch) {
        return NextResponse.json(
          {
            success: false,
            message: "The current password is invalid.",
          },
          { status: 401 },
        )
      }

      if (body.newPassword) {
        hashedPassword = body.newPassword && hashSync(body.newPassword, 12)

        if (!hashedPassword) {
          return NextResponse.json(
            {
              success: false,
              message: "An error occurred. Please try again later.",
            },
            { status: 500 },
          )
        }
      }
    }

    // @ts-ignore
    const updatedUser: User = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        password: hashedPassword,
      },
    })

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          message: "An error occurred. Please try again later.",
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "The password has been updated!",
      },
      { status: 200 },
    )
  } catch (error) {
    return getPrismaError(error)
  }
}
