"use server"

import { NextResponse } from "next/server"
import { type Static, Type } from "@sinclair/typebox"
import { Value, ValueError } from "@sinclair/typebox/value"
import { POST } from "@/app/api/forgot-password/route"

const forgotPasswordSchema = Type.Object({
  email: Type.String({ minLength: 1 })
})

export type ForgotPasswordData = Static<typeof forgotPasswordSchema>

export type ForgotPasswordErrorMessages<T extends string> = {
  [K in T]?: string
}

export async function forgotPassword(prevState: any, formData: FormData) {
  const rawFormData: ForgotPasswordData = {
    email: formData.get("email") as string
  }

  const errors: ValueError[] = Array.from(Value.Errors(forgotPasswordSchema, rawFormData))
  const errorMessages: ForgotPasswordErrorMessages<keyof ForgotPasswordData> = {}

  for (const error of errors) {
    switch (error.path.replace("/", "")) {
      case "email":
        errorMessages.email = "Email is invalid."
        break
      default:
        console.error(`Forgot Password Action: Unknown error at ${error.path}`)
        break
    }
  }

  if (Object.keys(errorMessages).length === 0) {
    const response: NextResponse = await POST(rawFormData)
    return await response.json()
  }

  return {
    success: false,
    errors: errorMessages
  }
}
