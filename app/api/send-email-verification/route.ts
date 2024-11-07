import { NextRequest, NextResponse } from "next/server"
import { VerificationToken } from "@prisma/client"
import { sendEmailChangeEmail } from "@/lib/email"
import { generateEmailChangeVerificationToken } from "@/lib/token"
import { getPrismaError } from "@/utils/api"

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { user } = await request.json()

    // Do not let third-party users send an email
    if (user.accounts?.length === 0) {
      const token: VerificationToken | null = await generateEmailChangeVerificationToken(user.id)

      if (token) {
        // Send email verification
        await sendEmailChangeEmail(user.name, user.email, token.token)
      }
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "A verification email has been sent to your new email address. Please check your inbox or your spam folder."
      },
      { status: 201 }
    )
  } catch (error) {
    return getPrismaError(error)
  }
}
