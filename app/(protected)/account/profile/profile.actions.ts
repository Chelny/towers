"use server"

import { NextResponse } from "next/server"
import { Gender, User } from "@prisma/client"
import { Value, ValueError } from "@sinclair/typebox/value"
import {
  ProfileFormData,
  ProfileFormErrorMessages,
  profileSchema
} from "@/app/(protected)/account/profile/profile.schema"
import { PATCH } from "@/app/api/account/profile/route"

export async function profile(prevState: ApiResponse<User>, formData: FormData): Promise<ApiResponse<User>> {
  const rawFormData: ProfileFormData = {
    name: formData.get("name") as string,
    gender: formData.get("gender") as Gender,
    birthdate: formData.get("birthdate") as string,
    email: formData.get("email") as string,
    username: formData.get("username") as string,
    image: formData.get("image") as string
  }

  const errors: ValueError[] = Array.from(Value.Errors(profileSchema, rawFormData))
  const errorMessages: ProfileFormErrorMessages = {}

  for (const error of errors) {
    switch (error.path.replace("/", "")) {
      case "name":
        errorMessages.name = "The name is invalid."
        break
      case "gender":
        if (rawFormData.gender) {
          errorMessages.gender = "The gender is invalid."
        }
        break
      case "birthdate":
        if (rawFormData.birthdate) {
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
    const response: NextResponse = await PATCH(rawFormData)
    const data = await response.json()
    return data
  }

  return {
    success: false,
    error: errorMessages
  }
}
