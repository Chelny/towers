import { NextResponse } from "next/server"
import { User, UserStatus, VerificationToken } from "@prisma/client"
import { VerifyEmailFormData } from "@/app/(auth)/verify-email/verify-email.schema"
import { getUserById } from "@/data/user"
import { getVerificationTokenByIdentifierToken } from "@/data/verification-token"
import prisma from "@/lib/prisma"

export async function PATCH(body: VerifyEmailFormData): Promise<NextResponse> {
  // Check token validity
  const token: VerificationToken | null = await getVerificationTokenByIdentifierToken(body.token)

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
      { status: 403 }
    )
  }

  // Validate user and token
  const user: User | null = await getUserById(token.identifier)

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        message: "We couldn’t find an account with that email. Please check the email address and try again."
      },
      { status: 404 }
    )
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
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
