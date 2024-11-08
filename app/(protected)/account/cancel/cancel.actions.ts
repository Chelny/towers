"use server"

import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies"
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies"
import { cookies } from "next/headers"
import { Value, ValueError } from "@sinclair/typebox/value"
import {
  CancelAccountFormValidationErrors,
  CancelAccountPayload,
  cancelAccountSchema,
} from "@/app/(protected)/account/cancel/cancel.schema"

export async function cancelAccount(prevState: ApiResponse, formData: FormData): Promise<ApiResponse> {
  const payload: CancelAccountPayload = {
    email: formData.get("email") as string,
  }

  const errors: ValueError[] = Array.from(Value.Errors(cancelAccountSchema, payload))
  const errorMessages: CancelAccountFormValidationErrors = {}

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
    const cookieStore: ReadonlyRequestCookies = await cookies()
    const authToken: RequestCookie | undefined = cookieStore.get("authjs.session-token")
    const headerCookie: string = authToken ? `${authToken.name}=${authToken.value}` : ""
    const response: Response = await fetch(`${process.env.BASE_URL}/api/account`, {
      method: "DELETE",
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
