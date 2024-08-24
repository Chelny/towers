"use client"

import { ReactNode } from "react"
import { useFormState, useFormStatus } from "react-dom"
import {
  signInWithMagicLink,
  SignInWithMagicLinkData,
  SignInWithMagicLinkErrorMessages
} from "@/app/(auth)/sign-in-with-magic-link/sign-in-with-magic-link.actions"
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

  return (
    <form className="w-full" action={formAction} noValidate>
      <Input id="email" label="Email" required errorMessage={state.errors?.email} />
      <Button type="submit" className="w-full" disabled={pending}>
        Sign In With Magic Link
      </Button>
    </form>
  )
}
