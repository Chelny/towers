"use server"

import { NextResponse } from "next/server"
import { Gender } from "@prisma/client"
import { type Static, Type } from "@sinclair/typebox"
import { Value, ValueError } from "@sinclair/typebox/value"
import { POST } from "@/app/api/sign-up/route"
import { BIRTH_DATE_PATTERN, EMAIL_PATTERN, NAME_PATTERN, PASSWORD_PATTERN, USERNAME_PATTERN } from "@/constants"

const GenderType = Type.Union([Type.Literal(Gender.M), Type.Literal(Gender.F), Type.Literal(Gender.X)])

const signUpSchema = Type.Object({
  name: Type.RegExp(NAME_PATTERN),
  gender: Type.Optional(GenderType),
  birthdate: Type.Optional(Type.RegExp(BIRTH_DATE_PATTERN)),
  email: Type.RegExp(EMAIL_PATTERN),
  username: Type.RegExp(USERNAME_PATTERN),
  password: Type.RegExp(PASSWORD_PATTERN),
  confirmPassword: Type.RegExp(PASSWORD_PATTERN)
})

export type SignUpData = Static<typeof signUpSchema>

export type SignUpErrorMessages<T extends string> = {
  [K in T]?: string
}

export async function signUp(prevState: any, formData: FormData) {
  const rawFormData: SignUpData = {
    name: formData.get("name") as string,
    gender: formData.get("gender") as Gender,
    birthdate: formData.get("birthdate") as string,
    email: formData.get("email") as string,
    username: formData.get("username") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string
  }

  const errors: ValueError[] = Array.from(Value.Errors(signUpSchema, rawFormData))
  const errorMessages: SignUpErrorMessages<keyof SignUpData> = {}

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
      case "password":
        errorMessages.password = "The password is invalid."
        break
      case "confirmPassword":
        errorMessages.confirmPassword = "The password confirmation is invalid."
        break
      default:
        console.error(`Sign Up Action: Unknown error at ${error.path}`)
        break
    }
  }

  if (rawFormData.password !== rawFormData.confirmPassword) {
    errorMessages.confirmPassword = "The password and password confirmation do not match."
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
