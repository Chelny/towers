"use server"

import { NextResponse } from "next/server"
import { Value, ValueError } from "@sinclair/typebox/value"
import {
  ConfirmEmailChangeFormData,
  ConfirmEmailChangeFormErrorMessages,
  confirmEmailChangeSchema
} from "@/app/(auth)/confirm-email-change/confirm-email-change.schema"
import { PATCH } from "@/app/api/confirm-email-change/route"

export async function confirmEmailChange(prevState: ApiResponse, formData: FormData): Promise<ApiResponse> {
  const rawFormData: ConfirmEmailChangeFormData = {
    token: formData.get("token") as string
  }

  const errors: ValueError[] = Array.from(Value.Errors(confirmEmailChangeSchema, rawFormData))
  const errorMessages: ConfirmEmailChangeFormErrorMessages = {}

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
    const response: NextResponse = await PATCH(rawFormData)
    const data = await response.json()
    return data
  }

  return {
    success: false,
    message: "The verification link is invalid.",
    error: errorMessages
  }
}
