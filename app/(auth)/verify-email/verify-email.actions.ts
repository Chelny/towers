"use server"

import { NextResponse } from "next/server"
import { Value, ValueError } from "@sinclair/typebox/value"
import {
  VerifyEmailFormData,
  VerifyEmailFormErrorMessages,
  verifyEmailSchema
} from "@/app/(auth)/verify-email/verify-email.schema"
import { PATCH } from "@/app/api/verify-email/route"

export async function verifyEmail(prevState: ApiResponse, formData: FormData): Promise<ApiResponse> {
  const rawFormData: VerifyEmailFormData = {
    email: formData.get("email") as string,
    token: formData.get("token") as string
  }

  const errors: ValueError[] = Array.from(Value.Errors(verifyEmailSchema, rawFormData))
  const errorMessages: VerifyEmailFormErrorMessages = {}

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
