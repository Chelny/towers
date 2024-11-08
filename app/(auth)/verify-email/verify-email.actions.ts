"use server"

import { Value, ValueError } from "@sinclair/typebox/value"
import {
  VerifyEmailFormValidationErrors,
  VerifyEmailPayload,
  verifyEmailSchema,
} from "@/app/(auth)/verify-email/verify-email.schema"

export async function verifyEmail(prevState: ApiResponse, formData: FormData): Promise<ApiResponse> {
  const payload: VerifyEmailPayload = {
    token: formData.get("token") as string,
  }

  const errors: ValueError[] = Array.from(Value.Errors(verifyEmailSchema, payload))
  const errorMessages: VerifyEmailFormValidationErrors = {}

  for (const error of errors) {
    switch (error.path.replace("/", "")) {
      case "token":
        errorMessages.token = "The token is missing or invalid."
        break
      default:
        console.error(`Verify Email Action: Unknown error at ${error.path}`)
        break
    }
  }

  if (Object.keys(errorMessages).length === 0) {
    const response: Response = await fetch(`${process.env.BASE_URL}/api/verify-email`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })

    return await response.json()
  }

  return {
    success: false,
    message: "The verification link is invalid.",
    error: errorMessages,
  }
}
