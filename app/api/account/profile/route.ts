import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { User, UserStatus, VerificationToken } from "@prisma/client"
import { Session } from "next-auth"
import { ProfileFormData } from "@/app/(protected)/account/profile/profile.schema"
import { auth } from "@/auth"
import { ROUTE_PROFILE } from "@/constants/routes"
import { getUserById, getUserByUsername } from "@/data/user"
import { sendEmailChangeEmail } from "@/lib/email"
import prisma from "@/lib/prisma"
import { generateEmailChangeVerificationToken } from "@/lib/token"

export async function GET(): Promise<NextResponse> {
  const session: Session | null = await auth()

  if (!session) {
    return NextResponse.json(
      {
        success: false,
        message: "Please sign in to access your account."
      },
      { status: 401 }
    )
  }

  const user: Partial<User> | null = await prisma.user.findUnique({
    where: {
      id: session.user.id
    },
    select: {
      name: true,
      birthdate: true,
      email: true,
      pendingEmail: true,
      username: true,
      image: true,
      status: true,
      accounts: {
        select: {
          provider: true
        }
      }
    }
  })

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        message: "We couldn’t find an account with that information. Please check your details and try again."
      },
      { status: 404 }
    )
  }

  return NextResponse.json(
    {
      success: true,
      data: user
    },
    { status: 200 }
  )
}

export async function PATCH(body: ProfileFormData): Promise<NextResponse> {
  const session: Session | null = await auth()

  if (!session) {
    return NextResponse.json(
      {
        success: false,
        message: "Sorry, your request could not be processed."
      },
      { status: 401 }
    )
  }

  const user: User | null = await getUserById(session.user.id)

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        message: "We couldn’t find an account with that information. Please check your details and try again."
      },
      { status: 404 }
    )
  }

  const existingUser: User | null = await getUserByUsername(body.username)

  if (existingUser && existingUser.id !== session.user.id) {
    return NextResponse.json(
      {
        success: false,
        message: "That username is already in use. Please choose a different one."
      },
      { status: 409 }
    )
  }

  let userData: Partial<User> = {
    name: body.name,
    birthdate: body.birthdate ? new Date(body.birthdate) : undefined,
    username: body.username,
    image: body.image
  }

  let successMessage: string = "Your profile has been updated!"

  // Do not let third-party users change their email
  if (session.account?.provider === "credentials") {
    if (user.email !== body.email) {
      const token: VerificationToken | null = await generateEmailChangeVerificationToken(session.user.id)

      if (token) {
        // Send email verification
        await sendEmailChangeEmail(body.name, body.email, token.token)

        userData = {
          ...userData,
          pendingEmail: body.email,
          status: UserStatus.PENDING_EMAIL_VERIFICATION
        }

        successMessage +=
          " A verification email has been sent to your new email address. Please check your inbox or your spam folder."
      }
    }
  }

  const updatedUser: User = await prisma.user.update({
    where: {
      id: session.user.id
    },
    data: userData
  })

  if (!updatedUser) {
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred. Please try again later."
      },
      { status: 500 }
    )
  }

  revalidatePath(ROUTE_PROFILE.PATH)

  return NextResponse.json(
    {
      success: true,
      message: successMessage,
      data: {
        name: updatedUser.name,
        birthdate: updatedUser.birthdate,
        email: updatedUser.email,
        pendingEmail: updatedUser.pendingEmail,
        username: updatedUser.username,
        image: updatedUser.image,
        status: updatedUser.status
      }
    },
    { status: 200 }
  )
}
