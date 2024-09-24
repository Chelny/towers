"use client"

import { FormEvent, ReactNode } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { forgotPassword } from "@/app/(auth)/forgot-password/forgot-password.actions"
import { ForgotPasswordErrorMessages } from "@/app/(auth)/forgot-password/forgot-password.schema"
import AlertMessage from "@/components/ui/AlertMessage"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"

const initialState = {
  success: false,
  message: "",
  error: {} as ForgotPasswordErrorMessages
}

export function ForgotPasswordForm(): ReactNode {
  const { pending } = useFormStatus()
  const [state, formAction] = useFormState<ApiResponse, FormData>(forgotPassword, initialState)

  const handleSendEmail = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const formData: FormData = new FormData(event.currentTarget)
    formAction(formData)
  }

  return (
    <form className="w-full" noValidate onSubmit={handleSendEmail}>
      {state?.message && <AlertMessage type={state.success ? "success" : "error"}>{state.message}</AlertMessage>}
      <Input
        id="email"
        label="Email"
        required
        dataTestId="forgot-password-email-input"
        errorMessage={state?.error?.email}
      />
      <Button type="submit" className="w-full" disabled={pending} dataTestId="forgot-password-submit-button">
        Send Email
      </Button>
    </form>
  )
}
