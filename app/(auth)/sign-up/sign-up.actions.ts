"use server"

import { NextResponse } from "next/server"
import { Value, ValueError } from "@sinclair/typebox/value"
import { SignUpFormData, SignUpFormErrorMessages, signUpSchema } from "@/app/(auth)/sign-up/sign-up.schema"
import { POST } from "@/app/api/sign-up/route"

export async function signUp(prevState: ApiResponse, formData: FormData): Promise<ApiResponse> {
  const rawFormData: SignUpFormData = {
    name: formData.get("name") as string,
    birthdate: formData.get("birthdate") as string,
    email: formData.get("email") as string,
    username: formData.get("username") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
    termsAndConditions: formData.get("termsAndConditions") === "on"
  }

  const errors: ValueError[] = Array.from(Value.Errors(signUpSchema, rawFormData))
  const errorMessages: SignUpFormErrorMessages = {}

  for (const error of errors) {
    switch (error.path.replace("/", "")) {
      case "name":
        errorMessages.name = "The name is invalid."
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
      case "termsAndConditions":
        errorMessages.termsAndConditions = "You must accept the terms and conditions."
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
    const data = await response.json()
    return data
  }

  return {
    success: false,
    error: errorMessages
  }
}
