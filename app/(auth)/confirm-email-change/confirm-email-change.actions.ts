"use server"

import { Value, ValueError } from "@sinclair/typebox/value"
import {
  ConfirmEmailChangeFormValidationErrors,
  ConfirmEmailChangePayload,
  confirmEmailChangeSchema,
} from "@/app/(auth)/confirm-email-change/confirm-email-change.schema"

export async function confirmEmailChange(prevState: ApiResponse, formData: FormData): Promise<ApiResponse> {
  const payload: ConfirmEmailChangePayload = {
    token: formData.get("token") as string,
  }

  const errors: ValueError[] = Array.from(Value.Errors(confirmEmailChangeSchema, payload))
  const errorMessages: ConfirmEmailChangeFormValidationErrors = {}

  for (const error of errors) {
    switch (error.path.replace("/", "")) {
      case "token":
        errorMessages.token = "The token is missing or invalid."
        break
      default:
        console.error(`Update Email Action: Unknown error at ${error.path}`)
        break
    }
  }

  if (Object.keys(errorMessages).length === 0) {
    const response: Response = await fetch(`${process.env.BASE_URL}/api/confirm-email-change`, {
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
