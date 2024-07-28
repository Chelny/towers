"use server"

import { NextResponse } from "next/server"
import { type Static, Type } from "@sinclair/typebox"
import { Value, ValueError } from "@sinclair/typebox/value"
import { POST } from "@/app/api/reset-password/route"
import { PASSWORD_PATTERN } from "@/constants"

const resetPasswordSchema = Type.Object({
  token: Type.String(),
  password: Type.RegExp(PASSWORD_PATTERN),
  confirmPassword: Type.RegExp(PASSWORD_PATTERN)
})

export type ResetPasswordData = Static<typeof resetPasswordSchema>

export type ResetPasswordErrorMessages<T extends string> = {
  [K in T]?: string
}

export async function resetPassword(prevState: any, formData: FormData) {
  const rawFormData: ResetPasswordData = {
    token: formData.get("token") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string
  }

  const errors: ValueError[] = Array.from(Value.Errors(resetPasswordSchema, rawFormData))
  const errorMessages: ResetPasswordErrorMessages<keyof ResetPasswordData> = {}

  for (const error of errors) {
    switch (error.path.replace("/", "")) {
      case "password":
        errorMessages.password = "Password is invalid."
        break
      case "confirmPassword":
        errorMessages.confirmPassword = "Confirm password is invalid."
        break
      default:
        console.error(`Reset Password Action: Unknown error at ${error.path}`)
        break
    }
  }

  if (rawFormData.password !== rawFormData.confirmPassword) {
    errorMessages.confirmPassword = "Password and Confirm Password do not match."
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
