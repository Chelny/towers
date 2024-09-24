"use server"

import { Value, ValueError } from "@sinclair/typebox/value"
import { AuthError } from "next-auth"
import { SignInFormData, SignInFormErrorMessages, signInSchema } from "@/app/(auth)/sign-in/sign-in.schema"
import { signIn as authSignIn } from "@/auth"
import { SIGN_IN_REDIRECT } from "@/constants/routes"

export async function signIn(prevState: ApiResponse, formData: FormData): Promise<ApiResponse> {
  const rawFormData: SignInFormData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string
  }

  const errors: ValueError[] = Array.from(Value.Errors(signInSchema, rawFormData))
  const errorMessages: SignInFormErrorMessages = {}

  for (const error of errors) {
    switch (error.path.replace("/", "")) {
      case "email":
        errorMessages.email = "The email is invalid."
        break
      case "password":
        errorMessages.password = "The password is invalid."
        break
      default:
        console.error(`Sign In Action: Unknown error at ${error.path}`)
        break
    }
  }

  if (Object.keys(errorMessages).length === 0) {
    try {
      await authSignIn("credentials", {
        ...rawFormData,
        redirectTo: SIGN_IN_REDIRECT
      })

      return {
        success: true,
        message: "You’re successfully signed in. Welcome back!"
      }
    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.type) {
          case "CredentialsSignin":
            return {
              success: false,
              message: "The email or the password is invalid."
            }
          default:
            return {
              success: false,
              message: error.cause?.err?.message
            }
        }
      }

      throw error
    }
  }

  return {
    success: false,
    message: "The email or the password is invalid.",
    error: errorMessages
  }
}
