"use server"

import { NextResponse } from "next/server"
import { Value, ValueError } from "@sinclair/typebox/value"
import {
  UpdateEmailFormData,
  UpdateEmailFormErrorMessages,
  updateEmailSchema
} from "@/app/(auth)/update-email/update-email.schema"
import { PATCH } from "@/app/api/update-email/route"

export async function updateEmail(prevState: ApiResponse, formData: FormData): Promise<ApiResponse> {
  const rawFormData: UpdateEmailFormData = {
    token: formData.get("token") as string
  }

  const errors: ValueError[] = Array.from(Value.Errors(updateEmailSchema, rawFormData))
  const errorMessages: UpdateEmailFormErrorMessages = {}

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
