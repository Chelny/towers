"use server"

import { type Static, Type } from "@sinclair/typebox"
import { Value, ValueError } from "@sinclair/typebox/value"
import { AuthError } from "next-auth"
import { signIn as authSignInWithMagicLink } from "@/auth"
import { EMAIL_PATTERN, SIGN_IN_REDIRECT } from "@/constants"

const signInWithMagicLinkSchema = Type.Object({
  email: Type.RegExp(EMAIL_PATTERN)
})

export type SignInWithMagicLinkData = Static<typeof signInWithMagicLinkSchema>

export type SignInWithMagicLinkErrorMessages<T extends string> = {
  [K in T]?: string
}

export async function signInWithMagicLink(prevState: any, formData: FormData) {
  const rawFormData: SignInWithMagicLinkData = {
    email: formData.get("email") as string
  }

  const errors: ValueError[] = Array.from(Value.Errors(signInWithMagicLinkSchema, rawFormData))
  const errorMessages: SignInWithMagicLinkErrorMessages<keyof SignInWithMagicLinkData> = {}

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
    errors: errorMessages
  }
}
