"use server"

import { Value, ValueError } from "@sinclair/typebox/value"
import {
  ResetPasswordFormValidationErrors,
  ResetPasswordPayload,
  resetPasswordSchema,
} from "@/app/(auth)/reset-password/reset-password.schema"

export async function resetPassword(prevState: ApiResponse, formData: FormData): Promise<ApiResponse> {
  const payload: ResetPasswordPayload = {
    token: formData.get("token") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  }

  const errors: ValueError[] = Array.from(Value.Errors(resetPasswordSchema, payload))
  const errorMessages: ResetPasswordFormValidationErrors = {}

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

  if (payload.password !== payload.confirmPassword) {
    errorMessages.confirmPassword = "The password and password confirmation do not match."
  }

  if (Object.keys(errorMessages).length === 0) {
    const response: Response = await fetch(`${process.env.BASE_URL}/api/reset-password`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })

    return await response.json()
  }

  return {
    success: false,
    error: errorMessages,
  }
}
