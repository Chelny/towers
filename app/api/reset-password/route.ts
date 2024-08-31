import { NextRequest, NextResponse } from "next/server"
import { PasswordResetToken, User } from "@prisma/client"
import { hash } from "bcryptjs"
import { ResetPasswordData } from "@/app/(auth)/reset-password/reset-password.actions"
import { getPasswordResetTokenByToken, getUserByEmail } from "@/data"
import prisma from "@/lib"

export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams: URLSearchParams = request.nextUrl.searchParams
  const token: string | null = searchParams.get("token")

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        error: "The token is invalid."
      },
      { status: 401 }
    )
  }

  const passwordResetToken: PasswordResetToken | null = await prisma.passwordResetToken.findUnique({
    where: { token }
  })

  if (!passwordResetToken || new Date() > passwordResetToken.expires) {
    return NextResponse.json(
      {
        success: false,
        error: "The token is invalid."
      },
      { status: 401 }
    )
  }

  return NextResponse.json(
    {
      success: true
    },
    { status: 200 }
  )
}

export async function POST(body: ResetPasswordData): Promise<NextResponse> {
  // Check token validity
  const existingToken = await getPasswordResetTokenByToken(body.token)

  if (!existingToken) {
    return NextResponse.json(
      {
        success: false,
        message: "The token is missing or invalid."
      },
      { status: 404 }
    )
  }

  // Check token expiration date
  const hasExpired = new Date(existingToken.expires) < new Date()

  if (hasExpired) {
    return NextResponse.json(
      {
        success: false,
        message: "The token is expired."
      },
      { status: 403 }
    )
  }

  // Validate user and token
  const existingUser: User | null = await getUserByEmail(existingToken.email)

  if (!existingUser) {
    return NextResponse.json(
      {
        success: false,
        message: "We couldn’t find an account with that email. Please check the email address and try again."
      },
      { status: 404 }
    )
  }

  if (body.password) {
    const hashedPassword = await hash(body.password, 12)

    await prisma.user.update({
      where: { id: existingUser.id },
      data: { password: hashedPassword }
    })
  }

  await prisma.passwordResetToken.delete({ where: { id: existingToken.id } })

  return NextResponse.json(
    {
      success: true,
      message: "The password has been reset!"
    },
    { status: 200 }
  )
}
