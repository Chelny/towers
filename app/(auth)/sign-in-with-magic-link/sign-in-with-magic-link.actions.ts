"use server"

import { Value, ValueError } from "@sinclair/typebox/value"
import { AuthError } from "next-auth"
import {
  SignInWithMagicLinkFormData,
  SignInWithMagicLinkFormErrorMessages,
  signInWithMagicLinkSchema
} from "@/app/(auth)/sign-in-with-magic-link/sign-in-with-magic-link.schema"
import { signIn as authSignInWithMagicLink } from "@/auth"
import { SIGN_IN_REDIRECT } from "@/constants/routes"

export async function signInWithMagicLink(prevState: ApiResponse, formData: FormData): Promise<ApiResponse> {
  const rawFormData: SignInWithMagicLinkFormData = {
    email: formData.get("email") as string
  }

  const errors: ValueError[] = Array.from(Value.Errors(signInWithMagicLinkSchema, rawFormData))
  const errorMessages: SignInWithMagicLinkFormErrorMessages = {}

  for (const error of errors) {
    switch (error.path.replace("/", "")) {
      case "email":
        errorMessages.email = "The email is invalid."
        break
      default:
        console.error(`Sign Up With Magic Link Action: Unknown error at ${error.path}`)
        break
    }
  }

  if (Object.keys(errorMessages).length === 0) {
    try {
      await authSignInWithMagicLink("resend", {
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
    message: "",
    error: errorMessages
  }
}
