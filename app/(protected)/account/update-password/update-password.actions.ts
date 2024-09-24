"use server"

import { NextResponse } from "next/server"
import { Value, ValueError } from "@sinclair/typebox/value"
import {
  passwordSchema,
  UpdatePasswordFormData,
  UpdatePasswordFormErrorMessages
} from "@/app/(protected)/account/update-password/update-password.schema"
import { PATCH } from "@/app/api/account/password/route"

export async function password(prevState: ApiResponse, formData: FormData): Promise<ApiResponse> {
  const rawFormData: UpdatePasswordFormData = {
    currentPassword: formData.get("currentPassword") as string,
    newPassword: formData.get("newPassword") as string,
    confirmNewPassword: formData.get("confirmNewPassword") as string
  }

  const errors: ValueError[] = Array.from(Value.Errors(passwordSchema, rawFormData))
  const errorMessages: UpdatePasswordFormErrorMessages = {}

  for (const error of errors) {
    switch (error.path.replace("/", "")) {
      case "currentPassword":
        errorMessages.currentPassword = "The current password is invalid."
        break
      case "newPassword":
        errorMessages.newPassword = "The new password is invalid."
        break
      case "confirmNewPassword":
        errorMessages.confirmNewPassword = "The new password confirmation is invalid."
        break
      default:
        console.error(`UpdatePassword Action: Unknown error at ${error.path}`)
        break
    }
  }

  if (rawFormData.newPassword !== rawFormData.confirmNewPassword) {
    errorMessages.confirmNewPassword = "The new password and new password confirmation do not match."
  }

  if (Object.keys(errorMessages).length === 0) {
    const response: NextResponse = await PATCH(rawFormData)
    const data = await response.json()
    return data
  }

  return {
    success: false,
    error: errorMessages
  }
}
