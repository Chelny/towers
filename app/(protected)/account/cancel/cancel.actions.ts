"use server"

import { NextResponse } from "next/server"
import { Value, ValueError } from "@sinclair/typebox/value"
import {
  CancelAccountFormData,
  CancelAccountFormErrorMessages,
  cancelAccountSchema
} from "@/app/(protected)/account/cancel/cancel.schema"
import { DELETE } from "@/app/api/account/route"

export async function cancelAccount(prevState: ApiResponse, formData: FormData): Promise<ApiResponse> {
  const rawFormData: CancelAccountFormData = {
    email: formData.get("email") as string
  }

  const errors: ValueError[] = Array.from(Value.Errors(cancelAccountSchema, rawFormData))
  const errorMessages: CancelAccountFormErrorMessages = {}

  for (const error of errors) {
    switch (error.path.replace("/", "")) {
      case "email":
        errorMessages.email = "The email is invalid."
        break
      default:
        console.error(`Cancel Account Action: Unknown error at ${error.path}`)
        break
    }
  }

  if (Object.keys(errorMessages).length === 0) {
    const response: NextResponse = await DELETE(rawFormData)
    const data = await response.json()
    return data
  }

  return {
    success: false,
    error: errorMessages
  }
}
