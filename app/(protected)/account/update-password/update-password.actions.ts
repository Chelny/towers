"use server"

import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies"
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies"
import { cookies } from "next/headers"
import { Value, ValueError } from "@sinclair/typebox/value"
import {
  passwordSchema,
  UpdatePasswordFormValidationErrors,
  UpdatePasswordPayload,
} from "@/app/(protected)/account/update-password/update-password.schema"

export async function password(prevState: ApiResponse, formData: FormData): Promise<ApiResponse> {
  const payload: UpdatePasswordPayload = {
    currentPassword: formData.get("currentPassword") as string,
    newPassword: formData.get("newPassword") as string,
    confirmNewPassword: formData.get("confirmNewPassword") as string,
  }

  const errors: ValueError[] = Array.from(Value.Errors(passwordSchema, payload))
  const errorMessages: UpdatePasswordFormValidationErrors = {}

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

  if (payload.newPassword !== payload.confirmNewPassword) {
    errorMessages.confirmNewPassword = "The new password and new password confirmation do not match."
  }

  if (Object.keys(errorMessages).length === 0) {
    const cookieStore: ReadonlyRequestCookies = await cookies()
    const authToken: RequestCookie | undefined = cookieStore.get("authjs.session-token")
    const headerCookie: string = authToken ? `${authToken.name}=${authToken.value}` : ""
    const response: Response = await fetch(`${process.env.BASE_URL}/api/account/password`, {
      method: "PATCH",
      headers: {
        Cookie: headerCookie,
      },
      body: JSON.stringify(payload),
    })

    return await response.json()
  }

  return {
    success: false,
    error: errorMessages,
  }
}
