"use server"

import { Value, ValueError } from "@sinclair/typebox/value"
import {
  ForgotPasswordErrorMessages,
  ForgotPasswordPayload,
  forgotPasswordSchema,
} from "@/app/(auth)/forgot-password/forgot-password.schema"

export async function forgotPassword(prevState: ApiResponse, formData: FormData): Promise<ApiResponse> {
  const payload: ForgotPasswordPayload = {
    email: formData.get("email") as string,
  }

  const errors: ValueError[] = Array.from(Value.Errors(forgotPasswordSchema, payload))
  const errorMessages: ForgotPasswordErrorMessages = {}

  for (const error of errors) {
    switch (error.path.replace("/", "")) {
      case "email":
        errorMessages.email = "The email is required."
        break
      default:
        console.error(`Forgot Password Action: Unknown error at ${error.path}`)
        break
    }
  }

  if (Object.keys(errorMessages).length === 0) {
    const response: Response = await fetch(`${process.env.BASE_URL}/api/forgot-password`, {
      method: "POST",
      body: JSON.stringify(payload),
    })

    return await response.json()
  }

  return {
    success: false,
    error: errorMessages,
  }
}
