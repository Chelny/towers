import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { I18n } from "@lingui/core"
import { initLingui } from "@/app/init-lingui"
import { getPrismaError, unauthorized } from "@/lib/api"
import { auth } from "@/lib/auth"
import { Session } from "@/lib/auth-client"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json()

  const session: Session | null = await auth.api.getSession({ headers: await headers() })
  if (!session) return unauthorized()

  try {
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        language: body.language,
        theme: body.theme,
      },
    })

    const i18n: I18n = initLingui(body.language)

    return NextResponse.json(
      {
        success: true,
        message: i18n._("The settings have been updated!"),
      },
      { status: 200 },
    )
  } catch (error) {
    return getPrismaError(error)
  }
}
