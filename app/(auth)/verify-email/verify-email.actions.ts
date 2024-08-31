"use server"

import { NextResponse } from "next/server"
import { type Static, Type } from "@sinclair/typebox"
import { Value, ValueError } from "@sinclair/typebox/value"
import { POST } from "@/app/api/verify-email/route"
import { EMAIL_PATTERN } from "@/constants"

const verifyEmailSchema = Type.Object({
  email: Type.RegExp(EMAIL_PATTERN),
  token: Type.String({ minLength: 1 })
})

export type VerifyEmailData = Static<typeof verifyEmailSchema>

export type VerifyEmailErrorMessages<T extends string> = {
  [K in T]?: string
}

export async function verifyEmail(prevState: any, formData: FormData) {
  const rawFormData: VerifyEmailData = {
    email: formData.get("email") as string,
    token: formData.get("token") as string
  }

  const errors: ValueError[] = Array.from(Value.Errors(verifyEmailSchema, rawFormData))
  const errorMessages: VerifyEmailErrorMessages<keyof VerifyEmailData> = {}

  for (const error of errors) {
    switch (error.path.replace("/", "")) {
      case "email":
        errorMessages.email = "The email is missing."
        break
      case "token":
        errorMessages.token = "The token is missing or invalid."
        break
      default:
        console.error(`Verify Email Action: Unknown error at ${error.path}`)
        break
    }
  }

  if (Object.keys(errorMessages).length === 0) {
    const response: NextResponse = await POST(rawFormData)
    return await response.json()
  }

  return {
    success: false,
    message: "The verification link is invalid.",
    errors: errorMessages
  }
}
