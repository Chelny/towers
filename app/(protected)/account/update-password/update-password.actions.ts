"use server"

import { NextResponse } from "next/server"
import { type Static, Type } from "@sinclair/typebox"
import { Value, ValueError } from "@sinclair/typebox/value"
import { POST } from "@/app/api/account/password/route"
import { PASSWORD_PATTERN } from "@/constants"

const passwordSchema = Type.Object({
  currentPassword: Type.String({ minLength: 8 }),
  newPassword: Type.RegExp(PASSWORD_PATTERN),
  confirmNewPassword: Type.RegExp(PASSWORD_PATTERN)
})

export type UpdatePasswordData = Static<typeof passwordSchema>

export type UpdatePasswordErrorMessages<T extends string> = {
  [K in T]?: string
}

export async function password(prevState: any, formData: FormData) {
  const rawFormData: UpdatePasswordData = {
    currentPassword: formData.get("currentPassword") as string,
    newPassword: formData.get("newPassword") as string,
    confirmNewPassword: formData.get("confirmNewPassword") as string
  }

  const errors: ValueError[] = Array.from(Value.Errors(passwordSchema, rawFormData))
  const errorMessages: UpdatePasswordErrorMessages<keyof UpdatePasswordData> = {}

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
    const response: NextResponse = await POST(rawFormData)
    return await response.json()
  }

  return {
    success: false,
    errors: errorMessages
  }
}
