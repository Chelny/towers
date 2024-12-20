"use client"

import { FormEvent, ReactNode, useState } from "react"
import { ValueError } from "@sinclair/typebox/errors"
import { Value } from "@sinclair/typebox/value"
import {
  SignInWithMagicLinkFormValidationErrors,
  SignInWithMagicLinkPayload,
  signInWithMagicLinkSchema,
} from "@/app/(auth)/sign-in-with-magic-link/sign-in-with-magic-link.schema"
import AlertMessage from "@/components/ui/AlertMessage"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { INITIAL_FORM_STATE } from "@/constants/api"
import { REDIRECT_URI } from "@/constants/routes"
import { authClient } from "@/lib/auth-client"

export function SignInWithMagicLinkForm(): ReactNode {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [formState, setFormState] = useState<ApiResponse>(INITIAL_FORM_STATE)

  const handleSignInWithMagicLink = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()

    const formData: FormData = new FormData(event.currentTarget)
    const payload: SignInWithMagicLinkPayload = {
      email: formData.get("email") as string,
    }

    const errors: ValueError[] = Array.from(Value.Errors(signInWithMagicLinkSchema, payload))
    const errorMessages: SignInWithMagicLinkFormValidationErrors = {}

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

    if (Object.keys(errorMessages).length > 0) {
      setFormState({
        success: false,
        message: "Validation errors occurred.",
        error: errorMessages,
      })
    } else {
      await authClient.signIn.magicLink(
        {
          email: payload.email,
          callbackURL: REDIRECT_URI,
        },
        {
          onRequest: () => {
            setIsLoading(true)
            setFormState(INITIAL_FORM_STATE)
          },
          onSuccess: () => {
            setIsLoading(false)
            setFormState({
              success: true,
              message: `We’ve sent a magic sign-in link to ${payload.email}`,
            })
          },
          onError: (ctx) => {
            setIsLoading(false)
            setFormState({
              success: false,
              message: ctx.error.message,
            })
          },
        },
      )
    }
  }

  return (
    <form className="w-full" noValidate onSubmit={handleSignInWithMagicLink}>
      {formState.message && (
        <AlertMessage type={formState.success ? "success" : "error"}>{formState.message}</AlertMessage>
      )}
      <Input
        id="email"
        label="Email"
        required
        dataTestId="sign-in-with-magic-link-email-input"
        errorMessage={formState?.error?.email}
      />
      <Button type="submit" className="w-full" disabled={isLoading}>
        Email Me A Sign In Link
      </Button>
    </form>
  )
}
