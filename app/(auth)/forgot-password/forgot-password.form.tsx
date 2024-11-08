"use client"

import { ReactNode, useActionState } from "react"
import { forgotPassword } from "@/app/(auth)/forgot-password/forgot-password.actions"
import { ForgotPasswordErrorMessages } from "@/app/(auth)/forgot-password/forgot-password.schema"
import AlertMessage from "@/components/ui/AlertMessage"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"

const initialState = {
  success: false,
  message: "",
  error: {} as ForgotPasswordErrorMessages,
}

export function ForgotPasswordForm(): ReactNode {
  const [state, formAction, isPending] = useActionState<ApiResponse, FormData>(forgotPassword, initialState)

  return (
    <form className="w-full" action={formAction} noValidate>
      {state?.message && <AlertMessage type={state.success ? "success" : "error"}>{state.message}</AlertMessage>}
      <Input
        id="email"
        label="Email"
        required
        dataTestId="forgot-password-email-input"
        errorMessage={state?.error?.email}
      />
      <Button type="submit" className="w-full" disabled={isPending} dataTestId="forgot-password-submit-button">
        Send Email
      </Button>
    </form>
  )
}
