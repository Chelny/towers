import { NextResponse } from "next/server"
import { User, VerificationToken } from "@prisma/client"
import { hash } from "bcryptjs"
import { SignUpData } from "@/app/(auth)/sign-up/sign-up.actions"
import { getUserByEmail } from "@/data"
import prisma, { generateVerificationToken, sendVerificationEmail } from "@/lib"

export async function POST(body: SignUpData): Promise<NextResponse> {
  const user: User | null = await getUserByEmail(body.email)

  if (user) {
    return NextResponse.json(
      {
        success: false,
        message: "An account associated with this email already exists."
      },
      { status: 409 }
    )
  }

  const hashedPassword: string = body.password && (await hash(body.password, 12))

  if (!hashedPassword) {
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred. Please try again later."
      },
      { status: 500 }
    )
  }

  const newUser: User = await prisma.user.create({
    data: {
      name: body.name,
      gender: body.gender,
      birthdate: body.birthdate ? new Date(body.birthdate) : null,
      email: body.email,
      username: body.username,
      password: hashedPassword
    }
  })

  if (!newUser) {
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred. Please try again later."
      },
      { status: 500 }
    )
  }

  const token: VerificationToken | null = await generateVerificationToken(newUser.email)

  if (token) {
    await sendVerificationEmail(newUser.name, token.email, token.token)
  }

  return NextResponse.json(
    {
      success: true,
      message: `A confirmation email has been sent to ${body.email}. If you don't see it in your inbox, please check your spam or junk folder.`
    },
    { status: 201 }
  )
}
