"use client"

import { FormEvent, ReactNode } from "react"
import { useFormState, useFormStatus } from "react-dom"
import {
  signInWithMagicLink,
  SignInWithMagicLinkData,
  SignInWithMagicLinkErrorMessages
} from "@/app/(auth)/sign-in-with-magic-link/sign-in-with-magic-link.actions"
import AlertMessage from "@/components/ui/AlertMessage"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"

const initialState = {
  success: false,
  message: "",
  errors: {} as SignInWithMagicLinkErrorMessages<keyof SignInWithMagicLinkData>
}

export function SignInWithMagicLinkForm(): ReactNode {
  const { pending } = useFormStatus()
  const [state, formAction] = useFormState(signInWithMagicLink, initialState)

  const handleSignInWithMagicLink = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const formData: FormData = new FormData(event.currentTarget)
    formAction(formData)
  }

  return (
    <form className="w-full" noValidate onSubmit={handleSignInWithMagicLink}>
      {!state.success && state.message && <AlertMessage type="error">{state.message}</AlertMessage>}
      <Input
        id="email"
        label="Email"
        required
        dataTestId="sign-in-with-magic-link-email-input"
        errorMessage={state.errors?.email}
      />
      <Button type="submit" className="w-full" disabled={pending} dataTestId="sign-in-with-magic-link-submit-button">
        Sign In With Magic Link
      </Button>
    </form>
  )
}
