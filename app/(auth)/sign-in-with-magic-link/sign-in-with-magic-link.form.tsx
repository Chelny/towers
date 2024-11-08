"use client"

import { ReactNode, useActionState } from "react"
import { signInWithMagicLink } from "@/app/(auth)/sign-in-with-magic-link/sign-in-with-magic-link.actions"
import { SignInWithMagicLinkFormValidationErrors } from "@/app/(auth)/sign-in-with-magic-link/sign-in-with-magic-link.schema"
import AlertMessage from "@/components/ui/AlertMessage"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"

const initialState = {
  success: false,
  message: "",
  error: {} as SignInWithMagicLinkFormValidationErrors,
}

export function SignInWithMagicLinkForm(): ReactNode {
  const [state, formAction, isPending] = useActionState<ApiResponse, FormData>(signInWithMagicLink, initialState)

  return (
    <form className="w-full" action={formAction} noValidate>
      {!state.success && state.message && <AlertMessage type="error">{state.message}</AlertMessage>}
      <Input
        id="email"
        label="Email"
        required
        dataTestId="sign-in-with-magic-link-email-input"
        errorMessage={state?.error?.email}
      />
      <Button type="submit" className="w-full" disabled={isPending} dataTestId="sign-in-with-magic-link-submit-button">
        Email Me A Sign In Link
      </Button>
    </form>
  )
}
