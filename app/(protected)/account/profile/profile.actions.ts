"use server"

import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies"
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies"
import { cookies } from "next/headers"
import { User } from "@prisma/client"
import { Value, ValueError } from "@sinclair/typebox/value"
import {
  ProfileFormValidationErrors,
  ProfilePayload,
  profileSchema,
} from "@/app/(protected)/account/profile/profile.schema"

export async function profile(prevState: ApiResponse<User>, formData: FormData): Promise<ApiResponse<User>> {
  const payload: ProfilePayload = {
    name: formData.get("name") as string,
    birthdate: formData.get("birthdate") as string,
    email: formData.get("email") as string,
    username: formData.get("username") as string,
    image: formData.get("image") as string,
  }

  const errors: ValueError[] = Array.from(Value.Errors(profileSchema, payload))
  const errorMessages: ProfileFormValidationErrors = {}

  for (const error of errors) {
    switch (error.path.replace("/", "")) {
      case "name":
        errorMessages.name = "The name is invalid."
        break
      case "birthdate":
        if (payload.birthdate) {
          errorMessages.birthdate = "The birthdate is invalid."
        }
        break
      case "email":
        errorMessages.email = "The email is invalid."
        break
      case "username":
        errorMessages.username = "The username is invalid."
        break
      case "image":
        if (errorMessages.image) {
          errorMessages.image = "The image is invalid."
        }
        break
      default:
        console.error(`Profile Action: Unknown error at ${error.path}`)
        break
    }
  }

  if (Object.keys(errorMessages).length === 0) {
    const cookieStore: ReadonlyRequestCookies = await cookies()
    const authToken: RequestCookie | undefined = cookieStore.get("authjs.session-token")
    const headerCookie: string = authToken ? `${authToken.name}=${authToken.value}` : ""
    const response: Response = await fetch(`${process.env.BASE_URL}/api/account/profile`, {
      method: "PATCH",
      headers: {
        // "Content-Type": "multipart/form-data" // When uploading image
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
