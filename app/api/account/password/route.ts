import { NextResponse } from "next/server"
import { User } from "@prisma/client"
import { compare, hash } from "bcryptjs"
import { Session } from "next-auth"
import { UpdatePasswordData } from "@/app/(protected)/account/update-password/update-password.actions"
import { auth } from "@/auth"
import { getAccountsByUserId, getUserById } from "@/data"
import prisma from "@/lib"

export async function POST(body: UpdatePasswordData): Promise<NextResponse> {
  const session: Session | null = await auth()

  if (!session || !session.user) {
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

  const accounts = await getAccountsByUserId(session.user.id)

  if (accounts.length > 0) {
    return NextResponse.json(
      {
        success: false,
        message: "You cannot set a password as you are logged in using a third-party account."
      },
      { status: 401 }
    )
  }

  let hashedPassword

  if (body.currentPassword && user.password) {
    const isPasswordsMatch: boolean = await compare(body.currentPassword, user.password)
    if (!isPasswordsMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "The current password is invalid."
        },
        { status: 401 }
      )
    }

    if (body.newPassword) {
      hashedPassword = body.newPassword && (await hash(body.newPassword, 12))

      if (!hashedPassword) {
        return NextResponse.json(
          {
            success: false,
            message: "An error occurred. Please try again later."
          },
          { status: 500 }
        )
      }
    }
  }

  const updatedUser: User = await prisma.user.update({
    where: {
      id: session.user.id
    },
    data: {
      password: hashedPassword
    }
  })

  if (!updatedUser) {
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred. Please try again later."
      },
      { status: 500 }
    )
  }

  return NextResponse.json(
    {
      success: true,
      message: "The password has been successfully updated!"
    },
    { status: 200 }
  )
}
