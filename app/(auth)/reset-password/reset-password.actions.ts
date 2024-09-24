"use server"

import { NextResponse } from "next/server"
import { Value, ValueError } from "@sinclair/typebox/value"
import {
  ResetPasswordFormData,
  ResetPasswordFormErrorMessages,
  resetPasswordSchema
} from "@/app/(auth)/reset-password/reset-password.schema"
import { PATCH } from "@/app/api/reset-password/route"

export async function resetPassword(prevState: ApiResponse, formData: FormData): Promise<ApiResponse> {
  const rawFormData: ResetPasswordFormData = {
    token: formData.get("token") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string
  }

  const errors: ValueError[] = Array.from(Value.Errors(resetPasswordSchema, rawFormData))
  const errorMessages: ResetPasswordFormErrorMessages = {}

  for (const error of errors) {
    switch (error.path.replace("/", "")) {
      case "token":
        errorMessages.token = "The token is missing or invalid."
        break
      case "password":
        errorMessages.password = "The password is invalid."
        break
      case "confirmPassword":
        errorMessages.confirmPassword = "The password confirmation is invalid."
        break
      default:
        console.error(`Reset Password Action: Unknown error at ${error.path}`)
        break
    }
  }

  if (rawFormData.password !== rawFormData.confirmPassword) {
    errorMessages.confirmPassword = "The password and password confirmation do not match."
  }

  if (Object.keys(errorMessages).length === 0) {
    const response: NextResponse = await PATCH(rawFormData)
    const data = await response.json()
    return data
  }

  return {
    success: false,
    error: errorMessages
  }
}
