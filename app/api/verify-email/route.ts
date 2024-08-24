import { NextResponse } from "next/server"
import { UserStatus, VerificationToken } from "@prisma/client"
import { VerifyEmailData } from "@/app/(auth)/verify-email/verify-email.actions"
import { getUserByEmail, getVerificationTokenByToken } from "@/data"
import prisma from "@/lib"

export async function POST(body: VerifyEmailData): Promise<NextResponse> {
  // Check token validity
  const token: VerificationToken | null = await getVerificationTokenByToken(body.email, body.token)

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        message: "The token is missing or invalid."
      },
      { status: 404 }
    )
  }

  // Check token expiration date
  const isTokenExpired = new Date(token.expires) < new Date()

  if (isTokenExpired) {
    return NextResponse.json(
      {
        success: false,
        message: "The token is expired."
      },
      { status: 410 }
    )
  }

  // Validate user and token
  const user = await getUserByEmail(token.email)

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        message: "The email does not exist."
      },
      { status: 404 }
    )
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      email: token.email,
      status: UserStatus.ACTIVE
    }
  })

  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: token.identifier,
        token: token.token
      }
    }
  })

  return NextResponse.json(
    {
      success: true,
      message: "The email has been verified!"
    },
    { status: 200 }
  )
}
