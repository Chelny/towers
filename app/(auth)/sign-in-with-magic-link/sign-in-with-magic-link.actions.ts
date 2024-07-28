"use server"

import { type Static, Type } from "@sinclair/typebox"
import { Value, ValueError } from "@sinclair/typebox/value"
import { signIn as authSignInWithMagicLink } from "@/auth"

const signInWithMagicLinkSchema = Type.Object({
  email: Type.String({ minLength: 1 })
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
        errorMessages.email = "Email is invalid."
        break
      default:
        console.error(`Sign Up With Magic Link Action: Unknown error at ${error.path}`)
        break
    }
  }

  if (Object.keys(errorMessages).length === 0) {
    await authSignInWithMagicLink("resend", formData)
  }

  return {
    success: false,
    errors: errorMessages
  }
}
