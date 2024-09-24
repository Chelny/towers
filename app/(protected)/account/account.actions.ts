"use server"

import { NextResponse } from "next/server"
import { Value, ValueError } from "@sinclair/typebox/value"
import { AccountFormData, AccountFormErrorMessages, accountSchema } from "@/app/(protected)/account/account.schema"
import { DELETE } from "@/app/api/account/route"

export async function account(prevState: ApiResponse, formData: FormData): Promise<ApiResponse> {
  const rawFormData: AccountFormData = {
    email: formData.get("email") as string
  }

  const errors: ValueError[] = Array.from(Value.Errors(accountSchema, rawFormData))
  const errorMessages: AccountFormErrorMessages = {}

  for (const error of errors) {
    switch (error.path.replace("/", "")) {
      case "email":
        errorMessages.email = "The email is invalid."
        break
      default:
        console.error(`Delete Account Action: Unknown error at ${error.path}`)
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
