import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { APIError } from "better-auth/api"
import { Status } from "better-status-codes"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json()

  try {
    await auth.api.setPassword({
      headers: await headers(),
      body: {
        newPassword: body.password,
      },
    })
  } catch (error) {
    if (error instanceof APIError) {
      return NextResponse.json(
        {
          success: false,
          message: error.body.message,
        },
        // @ts-ignore
        { status: Status[error.status] },
      )
    }
  }

  return NextResponse.json(
    {
      success: true,
      message: "The password has been set!",
    },
    { status: 200 },
  )
}
