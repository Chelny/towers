"use client"

import { ReactNode } from "react"
import { useFormState, useFormStatus } from "react-dom"
import {
  forgotPassword,
  ForgotPasswordData,
  ForgotPasswordErrorMessages
} from "@/app/(auth)/forgot-password/forgot-password.actions"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"

const initialState = {
  success: false,
  message: "",
  errors: {} as ForgotPasswordErrorMessages<keyof ForgotPasswordData>
}

export function ForgotPasswordForm(): ReactNode {
  const { pending } = useFormStatus()
  const [state, formAction] = useFormState(forgotPassword, initialState)

  return (
    <form action={formAction} noValidate className="w-full">
      <Input id="email" label="Email" required errorMessage={state.errors?.email} />
      <Button type="submit" className="w-full" disabled={pending}>
        Send Email
      </Button>
    </form>
  )
}
