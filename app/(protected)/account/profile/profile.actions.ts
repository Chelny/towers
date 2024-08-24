"use server"

import { NextResponse } from "next/server"
import { Gender } from "@prisma/client"
import { type Static, Type } from "@sinclair/typebox"
import { Value, ValueError } from "@sinclair/typebox/value"
import { POST } from "@/app/api/account/profile/route"
import { BIRTH_DATE_PATTERN, EMAIL_PATTERN, NAME_PATTERN, USERNAME_PATTERN } from "@/constants"

const GenderType = Type.Union([Type.Literal(Gender.M), Type.Literal(Gender.F), Type.Literal(Gender.X)])

const profileSchema = Type.Object({
  name: Type.RegExp(NAME_PATTERN),
  gender: Type.Optional(GenderType),
  birthdate: Type.Optional(Type.RegExp(BIRTH_DATE_PATTERN)),
  email: Type.RegExp(EMAIL_PATTERN),
  username: Type.RegExp(USERNAME_PATTERN),
  image: Type.Optional(Type.String())
})

export type ProfileData = Static<typeof profileSchema>

export type ProfileErrorMessages<T extends string> = {
  [K in T]?: string
}

export async function profile(prevState: any, formData: FormData) {
  const rawFormData: ProfileData = {
    name: formData.get("name") as string,
    gender: formData.get("gender") as Gender,
    birthdate: formData.get("birthdate") as string,
    email: formData.get("email") as string,
    username: formData.get("username") as string,
    image: formData.get("image") as string
  }

  const errors: ValueError[] = Array.from(Value.Errors(profileSchema, rawFormData))
  const errorMessages: ProfileErrorMessages<keyof ProfileData> = {}

  for (const error of errors) {
    switch (error.path.replace("/", "")) {
      case "name":
        errorMessages.name = "Name is invalid."
        break
      case "gender":
        if (rawFormData.gender) {
          errorMessages.gender = "Gender is invalid."
        }
        break
      case "birthdate":
        if (rawFormData.birthdate) {
          errorMessages.birthdate = "Birthdate is invalid."
        }
        break
      case "email":
        errorMessages.email = "Email is invalid."
        break
      case "username":
        errorMessages.username = "Username is invalid."
        break
      case "image":
        if (errorMessages.image) {
          errorMessages.image = "Image is invalid."
        }
        break
      default:
        console.error(`Profile Action: Unknown error at ${error.path}`)
        break
    }
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
