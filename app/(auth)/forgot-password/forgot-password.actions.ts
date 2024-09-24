"use server"

import { NextResponse } from "next/server"
import { Value, ValueError } from "@sinclair/typebox/value"
import {
  ForgotPasswordErrorMessages,
  ForgotPasswordPayload,
  forgotPasswordSchema
} from "@/app/(auth)/forgot-password/forgot-password.schema"
import { POST } from "@/app/api/forgot-password/route"

export async function forgotPassword(prevState: ApiResponse, formData: FormData): Promise<ApiResponse> {
  const rawFormData: ForgotPasswordPayload = {
    email: formData.get("email") as string
  }

  const errors: ValueError[] = Array.from(Value.Errors(forgotPasswordSchema, rawFormData))
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
    const response: NextResponse = await POST(rawFormData)
    const data = await response.json()
    return data
  }

  return {
    success: false,
    error: errorMessages
  }
}
