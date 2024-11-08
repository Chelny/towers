"use server"

import { Value, ValueError } from "@sinclair/typebox/value"
import { SignUpFormValidationErrors, SignUpPayload, signUpSchema } from "@/app/(auth)/sign-up/sign-up.schema"

export async function signUp(prevState: ApiResponse, formData: FormData): Promise<ApiResponse> {
  const payload: SignUpPayload = {
    name: formData.get("name") as string,
    birthdate: formData.get("birthdate") as string,
    email: formData.get("email") as string,
    username: formData.get("username") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
    termsAndConditions: formData.get("termsAndConditions") === "on",
  }

  const errors: ValueError[] = Array.from(Value.Errors(signUpSchema, payload))
  const errorMessages: SignUpFormValidationErrors = {}

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

  if (payload.password !== payload.confirmPassword) {
    errorMessages.confirmPassword = "The password and password confirmation do not match."
  }

  if (Object.keys(errorMessages).length === 0) {
    const response: Response = await fetch(`${process.env.BASE_URL}/api/sign-up`, {
      method: "POST",
      body: JSON.stringify(payload),
    })

    return await response.json()
  }

  return {
    success: false,
    error: errorMessages,
  }
}
