"use client"

import { ReactNode, useEffect, useRef } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { password, PasswordData, PasswordErrorMessages } from "@/app/(protected)/account/password/password.actions"
import AlertMessage from "@/components/ui/AlertMessage"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"

const initialState = {
  success: false,
  message: "",
  errors: {} as PasswordErrorMessages<keyof PasswordData>
}

export function PasswordForm(): ReactNode {
  const { pending } = useFormStatus()
  const [state, formAction] = useFormState(password, initialState)
  const currentPasswordRef = useRef<HTMLInputElement>(null)
  const newPasswordRef = useRef<HTMLInputElement>(null)
  const confirmNewPasswordRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (state.success) {
      if (currentPasswordRef.current) {
        currentPasswordRef.current.value = ""
      }

      if (newPasswordRef.current) {
        newPasswordRef.current.value = ""
      }

      if (confirmNewPasswordRef.current) {
        confirmNewPasswordRef.current.value = ""
      }
    }
  }, [state])

  return (
    <form className="w-full" action={formAction} noValidate>
      {state.message && <AlertMessage type={state.success ? "success" : "error"}>{state.message}</AlertMessage>}
      <>
        <Input
          ref={currentPasswordRef}
          type="password"
          id="currentPassword"
          label="Current Password"
          autoComplete="off"
          required
          errorMessage={state.errors?.currentPassword}
        />
        <Input
          ref={newPasswordRef}
          type="password"
          id="newPassword"
          label="New Password"
          autoComplete="off"
          required
          description="Password must be at least 8 characters long, must contain at least one digit, one uppercase letter, and at least one special character."
          errorMessage={state.errors?.newPassword}
        />
        <Input
          ref={confirmNewPasswordRef}
          type="password"
          id="confirmNewPassword"
          label="Confirm New Password"
          autoComplete="off"
          required
          errorMessage={state.errors?.confirmNewPassword}
        />
      </>
      <Button type="submit" className="w-full" disabled={pending}>
        Update
      </Button>
    </form>
  )
}
