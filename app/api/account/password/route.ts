import { NextResponse } from "next/server"
import { User } from "@prisma/client"
import { compare, hash } from "bcryptjs"
import { PasswordData } from "@/app/(protected)/account/password/password.actions"
import { auth } from "@/auth"
import { getUserById } from "@/data"
import prisma from "@/lib"

export async function POST(body: PasswordData): Promise<NextResponse> {
  const session = await auth()

  if (!session || !session.user) {
    return NextResponse.json(
      {
        success: false,
        message: "User not authenticated."
      },
      { status: 401 }
    )
  }

  const user: User | null = await getUserById(session.user.id)

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        message: "User not found."
      },
      { status: 404 }
    )
  }

  const accounts = await prisma.account.findMany({
    where: {
      userId: session.user.id
    }
  })

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
      message: "Your password has been successfully updated!"
    },
    { status: 200 }
  )
}
