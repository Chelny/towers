import { NextRequest, NextResponse } from "next/server"
import { VerificationToken } from "@prisma/client"
import { sendEmailChangeEmail } from "@/lib/email"
import { generateEmailChangeVerificationToken } from "@/lib/token"

export async function POST(request: NextRequest): Promise<NextResponse> {
  const data = await request.json()

  // Do not let third-party users send an email
  if (data.user.accounts?.length === 0) {
    const token: VerificationToken | null = await generateEmailChangeVerificationToken(
      data.user.id,
      data.user.pendingEmail
    )

    if (token) {
      // Send email verification
      await sendEmailChangeEmail(data.user.name, token.email, token.token)
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
}
