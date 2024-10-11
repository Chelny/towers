import { NextResponse } from "next/server"
import { TowersUserProfile, User, UserStatus } from "@prisma/client"
import { compare } from "bcryptjs"
import { SignInFormData } from "@/app/(auth)/sign-in/sign-in.schema"
import { getUserByEmail } from "@/data/user"
import prisma from "@/lib/prisma"

export async function POST(body: SignInFormData): Promise<NextResponse> {
  const user: User | null = await getUserByEmail(body.email)
  if (!user) throw new Error("The email or the password is invalid.")

  if (body.password && user.password) {
    const isPasswordsMatch: boolean = await compare(body.password, user.password)
    if (!isPasswordsMatch) throw new Error("The email or the password is invalid.")
  }

  // Check user status
  switch (user.status) {
    case UserStatus.PENDING_EMAIL_VERIFICATION:
      if (!user.emailVerified) {
        throw new Error(
          "Your email verification is pending. Please check your inbox and verify your email to activate your account."
        )
      }
      break
    case UserStatus.BANNED:
      throw new Error("The account has been banned. Please contact customer support for assistance.")
    case UserStatus.PENDING_DELETION:
      await prisma.user.update({
        where: {
          id: user.id
        },
        data: {
          status: UserStatus.ACTIVE,
          deletionScheduledAt: null
        }
      })
      break
    default:
      break
  }

  return NextResponse.json(
    {
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          image: user.image
        }
      }
    },
    { status: 200 }
  )
}
