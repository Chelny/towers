import { NextRequest, NextResponse } from "next/server"
import { CreateEmailResponse, Resend } from "resend"
import EmailTemplate from "@/components/game/EmailTemplate"

type SendEmailData = {
  email: string
  subject: string
  html: string
  text: string
}

const resend: Resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body: SendEmailData = await request.json()

  try {
    const { data, error }: CreateEmailResponse = await resend.emails.send({
      from: process.env.EMAIL_SENDER as string,
      to: [process.env.EMAIL_RECIPIENT as string], // TODO: Production: Change to "body.email"
      subject: body.subject,
      react: EmailTemplate({ html: body.html }),
      text: body.text,
    })

    if (error) return NextResponse.json(error, { status: 500 })

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(error, { status: 500 })
  }
}
