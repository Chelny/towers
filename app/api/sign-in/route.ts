import { NextResponse } from "next/server"
import { TowersGameUser, User, UserStatus } from "@prisma/client"
import { compare } from "bcryptjs"
import { getUserByEmail } from "@/data"
import prisma from "@/lib"

export async function POST(body: { email: string; password: string }): Promise<NextResponse> {
  const user: User | null = await getUserByEmail(body.email)
  if (!user) throw new Error("The email or the password is invalid.")

  if (body.password && user.password) {
    const isPasswordsMatch: boolean = await compare(body.password, user.password)
    if (!isPasswordsMatch) throw new Error("The email or the password is invalid.")
  }

  // Check user status
  switch (user.status) {
    case UserStatus.PENDING_EMAIL_VERIFICATION:
      throw new Error(
        "Your email verification is pending. Please check your inbox and verify your email to activate your account."
      )
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

  // Update online status
  await prisma.user.update({
    where: { id: user.id },
    data: {
      isOnline: true,
      lastActiveAt: new Date()
    }
  })

  // Get or create Towers table entry
  const towersGameUser: TowersGameUser | null = await prisma.towersGameUser.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id }
  })

  return NextResponse.json(
    {
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          image: user.image,
          towersUserId: towersGameUser.id
        }
      }
    },
    { status: 200 }
  )
}
