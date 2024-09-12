import { NextResponse } from "next/server"
import { User } from "@prisma/client"
import { Session } from "next-auth"
import { ProfileData } from "@/app/(protected)/account/profile/profile.actions"
import { auth } from "@/auth"
import { getUserById, getUserByUsername } from "@/data"
import prisma from "@/lib"

export async function GET(): Promise<NextResponse> {
  const session: Session | null = await auth()

  if (!session?.user) {
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
      gender: true,
      birthdate: true,
      email: true,
      username: true,
      image: true,
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

export async function POST(body: ProfileData): Promise<NextResponse> {
  const session: Session | null = await auth()

  if (!session?.user) {
    return NextResponse.json(
      {
        success: false,
        message: "Please sign in to access your account."
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

  const updatedUser: User = await prisma.user.update({
    where: {
      id: session.user.id
    },
    data: {
      name: body.name,
      gender: body.gender,
      birthdate: body.birthdate ? new Date(body.birthdate) : null,
      email: body.email,
      username: body.username,
      image: body.image
    }
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

  return NextResponse.json(
    {
      success: true,
      message: "Your profile has been updated!",
      data: {
        name: updatedUser.name,
        gender: updatedUser.gender,
        birthdate: updatedUser.birthdate ? new Date(updatedUser.birthdate) : null,
        email: updatedUser.email,
        username: updatedUser.username,
        image: updatedUser.image
      }
    },
    { status: 200 }
  )
}
