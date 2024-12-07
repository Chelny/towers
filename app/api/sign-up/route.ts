import { NextRequest, NextResponse } from "next/server"
import { User, VerificationToken } from "@prisma/client"
import { hashSync } from "bcrypt-edge"
import { SignUpPayload } from "@/app/(auth)/sign-up/sign-up.schema"
import { getUserByEmail } from "@/data/user"
import { getPrismaError } from "@/lib/api"
import { sendVerificationEmail } from "@/lib/email"
import prisma from "@/lib/prisma"
import { generateEmailVerificationToken } from "@/lib/token"

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body: SignUpPayload = await request.json()

  try {
    const user: User | null = await getUserByEmail(body.email)

    if (user) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists. Please use a different email to create a new account.",
        },
        { status: 409 },
      )
    }

    const hashedPassword: string = body.password && hashSync(body.password, 12)

    if (!hashedPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "An error occurred. Please try again later.",
        },
        { status: 500 },
      )
    }

    // @ts-ignore
    const newUser: User = await prisma.user.create({
      data: {
        name: body.name,
        birthdate: body.birthdate ? new Date(body.birthdate) : undefined,
        email: body.email,
        username: body.username,
        password: hashedPassword,
      },
    })

    if (!newUser) {
      return NextResponse.json(
        {
          success: false,
          message: "An error occurred. Please try again later.",
        },
        { status: 500 },
      )
    }

    const token: VerificationToken | null = await generateEmailVerificationToken(newUser.id)

    if (token) {
      await sendVerificationEmail(newUser.name, body.email, token.token)
    }

    return NextResponse.json(
      {
        success: true,
        message: `A confirmation email has been sent to ${body.email}. If you don’t see it in your inbox, please check your spam or junk folder.`,
      },
      { status: 201 },
    )
  } catch (error) {
    return getPrismaError(error)
  }
}
