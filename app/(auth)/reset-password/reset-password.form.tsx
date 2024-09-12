"use client"

import { FormEvent, ReactNode } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation"
import {
  resetPassword,
  ResetPasswordData,
  ResetPasswordErrorMessages
} from "@/app/(auth)/reset-password/reset-password.actions"
import AlertMessage from "@/components/ui/AlertMessage"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"

const initialState = {
  success: false,
  message: "",
  errors: {} as ResetPasswordErrorMessages<keyof ResetPasswordData>
}

export function ResetPasswordForm(): ReactNode {
  const searchParams: ReadonlyURLSearchParams = useSearchParams()
  const token: string | null = searchParams.get("token")
  const { pending } = useFormStatus()
  const [state, formAction] = useFormState<any, FormData>(resetPassword, initialState)

  const handleResetPassword = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const formData: FormData = new FormData(event.currentTarget)
    formAction(formData)
  }

  return (
    <form className="w-full" noValidate onSubmit={handleResetPassword}>
      {state.message && <AlertMessage type={state.success ? "success" : "error"}>{state.message}</AlertMessage>}
      <Input
        type="password"
        id="password"
        label="Password"
        autoComplete="off"
        required
        dataTestId="reset-password-password-input"
        description="Password must be at least 8 characters long, must contain at least one digit, one uppercase letter, and at least one special character."
        errorMessage={state.errors?.password}
      />
      <Input
        type="password"
        id="confirmPassword"
        label="Confirm Password"
        autoComplete="off"
        required
        dataTestId="reset-password-confirm-password-input"
        errorMessage={state.errors?.confirmPassword}
      />
      <input
        type="hidden"
        id="token"
        name="token"
        value={token ?? undefined}
        data-testid="reset-password-token-input"
        required
      />
      <Button type="submit" className="w-full" disabled={pending} dataTestId="reset-password-submit-button">
        Reset Password
      </Button>
    </form>
  )
}
