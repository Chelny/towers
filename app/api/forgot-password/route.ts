import { NextRequest, NextResponse } from "next/server"
import { PasswordResetToken, User, UserStatus } from "@prisma/client"
import { ForgotPasswordPayload } from "@/app/(auth)/forgot-password/forgot-password.schema"
import { getUserByEmail } from "@/data/user"
import { getPrismaError } from "@/lib/api"
import { sendPasswordResetEmail } from "@/lib/email"
import { generatePasswordResetToken } from "@/lib/token"

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body: ForgotPasswordPayload = await request.json()

  try {
    const user: User | null = await getUserByEmail(body.email)

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "We couldn’t find an account with that email. Please check the email address and try again.",
        },
        { status: 404 },
      )
    }

    // Check user status
    switch (user.status) {
      case UserStatus.PENDING_EMAIL_VERIFICATION:
        throw new Error(
          "Your email verification is pending. Please check your inbox and verify your email to activate your account.",
        )
      case UserStatus.BANNED:
        throw new Error("The account has been banned. Please contact customer support for assistance.")
      default:
        break
    }

    const token: PasswordResetToken = await generatePasswordResetToken(user.email)
    await sendPasswordResetEmail(user.name, token.email, token.token)

    return NextResponse.json(
      {
        success: true,
        message: "A reset password link has been sent in your inbox!",
      },
      { status: 201 },
    )
  } catch (error) {
    return getPrismaError(error)
  }
}
