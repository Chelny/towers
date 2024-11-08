"use client"

import { ClipboardEvent, ReactNode, useActionState } from "react"
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation"
import { resetPassword } from "@/app/(auth)/reset-password/reset-password.actions"
import { ResetPasswordFormValidationErrors } from "@/app/(auth)/reset-password/reset-password.schema"
import AlertMessage from "@/components/ui/AlertMessage"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"

const initialState = {
  success: false,
  message: "",
  error: {} as ResetPasswordFormValidationErrors,
}

export function ResetPasswordForm(): ReactNode {
  const searchParams: ReadonlyURLSearchParams = useSearchParams()
  const token: string | null = searchParams.get("token")
  const [state, formAction, isPending] = useActionState<ApiResponse, FormData>(resetPassword, initialState)

  return (
    <form className="w-full" action={formAction} noValidate>
      {state?.message && <AlertMessage type={state.success ? "success" : "error"}>{state.message}</AlertMessage>}
      <Input
        type="password"
        id="password"
        label="Password"
        autoComplete="off"
        required
        dataTestId="reset-password-password-input"
        description="Password must be at least 8 characters long, must contain at least one digit, one uppercase letter, and at least one special character."
        errorMessage={state?.error?.password}
      />
      <Input
        type="password"
        id="confirmPassword"
        label="Confirm Password"
        autoComplete="off"
        required
        dataTestId="reset-password-confirm-password-input"
        onPaste={(event: ClipboardEvent<HTMLInputElement>) => event.preventDefault()}
        errorMessage={state?.error?.confirmPassword}
      />
      <input
        type="hidden"
        id="token"
        name="token"
        value={token ?? undefined}
        data-testid="reset-password-token-input"
        required
      />
      <Button type="submit" className="w-full" disabled={isPending} dataTestId="reset-password-submit-button">
        Reset Password
      </Button>
    </form>
  )
}
