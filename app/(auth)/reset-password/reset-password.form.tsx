"use client"

import { ReactNode } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { useSearchParams } from "next/navigation"
import {
  resetPassword,
  ResetPasswordData,
  ResetPasswordErrorMessages
} from "@/app/(auth)/reset-password/reset-password.actions"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"

const initialState = {
  success: false,
  message: "",
  errors: {} as ResetPasswordErrorMessages<keyof ResetPasswordData>
}

export function ResetPasswordForm(): ReactNode {
  const searchParams = useSearchParams()
  const token: string | null = searchParams.get("token")
  const { pending } = useFormStatus()
  const [state, formAction] = useFormState(resetPassword, initialState)

  return (
    <form className="w-full" action={formAction} noValidate>
      <Input
        type="password"
        id="password"
        label="Password"
        autoComplete="off"
        required
        description="Password must be at least 8 characters long, must contain at least one digit, one uppercase letter, and at least one special character."
        errorMessage={state.errors?.password}
      />
      <Input
        type="password"
        id="confirmPassword"
        label="Confirm Password"
        autoComplete="off"
        required
        errorMessage={state.errors?.confirmPassword}
      />
      <input type="hidden" id="token" name="token" value={token ?? undefined} required />
      <Button type="submit" className="w-full" disabled={pending}>
        Reset Password
      </Button>
    </form>
  )
}
