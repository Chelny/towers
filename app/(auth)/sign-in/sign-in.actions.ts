"use server"

import { type Static, Type } from "@sinclair/typebox"
import { Value, ValueError } from "@sinclair/typebox/value"
import { AuthError } from "next-auth"
import { signIn as authSignIn } from "@/auth"
import { SIGN_IN_REDIRECT } from "@/constants"

const signInSchema = Type.Object({
  email: Type.String({ minLength: 1 }),
  password: Type.String({ minLength: 1 })
})

export type SignInData = Static<typeof signInSchema>

export type SignInErrorMessages<T extends string> = {
  [K in T]?: string
}

export async function signIn(prevState: any, formData: FormData) {
  const rawFormData: SignInData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string
  }

  const errors: ValueError[] = Array.from(Value.Errors(signInSchema, rawFormData))
  const errorMessages: SignInErrorMessages<keyof SignInData> = {}

  for (const error of errors) {
    switch (error.path.replace("/", "")) {
      case "email":
        errorMessages.email = "Email is invalid."
        break
      case "password":
        errorMessages.password = "Password is invalid."
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
    message: "Email or password is invalid",
    errors: errorMessages
  }
}
