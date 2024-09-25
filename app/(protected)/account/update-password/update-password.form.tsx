"use client"

import { ClipboardEvent, FormEvent, ReactNode, useEffect, useRef } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { password } from "@/app/(protected)/account/update-password/update-password.actions"
import { UpdatePasswordFormErrorMessages } from "@/app/(protected)/account/update-password/update-password.schema"
import AlertMessage from "@/components/ui/AlertMessage"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"

const initialState = {
  success: false,
  message: "",
  error: {} as UpdatePasswordFormErrorMessages
}

export function UpdatePasswordForm(): ReactNode {
  const { pending } = useFormStatus()
  const [state, formAction] = useFormState<ApiResponse, FormData>(password, initialState)
  const currentPasswordRef = useRef<HTMLInputElement>(null)
  const newPasswordRef = useRef<HTMLInputElement>(null)
  const confirmNewPasswordRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (state?.success) {
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

  const handleUpdatePassword = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const formData: FormData = new FormData(event.currentTarget)
    formAction(formData)
  }

  return (
    <form className="w-full" noValidate onSubmit={handleUpdatePassword}>
      {state?.message && <AlertMessage type={state.success ? "success" : "error"}>{state.message}</AlertMessage>}
      <>
        <Input
          ref={currentPasswordRef}
          type="password"
          id="currentPassword"
          label="Current Password"
          autoComplete="off"
          required
          dataTestId="update-password-current-password-input"
          errorMessage={state?.error?.currentPassword}
        />
        <Input
          ref={newPasswordRef}
          type="password"
          id="newPassword"
          label="New Password"
          autoComplete="off"
          required
          dataTestId="update-password-new-password-input"
          description="Password must be at least 8 characters long, must contain at least one digit, one uppercase letter, and at least one special character."
          errorMessage={state?.error?.newPassword}
        />
        <Input
          ref={confirmNewPasswordRef}
          type="password"
          id="confirmNewPassword"
          label="Confirm New Password"
          autoComplete="off"
          required
          dataTestId="update-password-confirm-new-password-input"
          onPaste={(event: ClipboardEvent<HTMLInputElement>) => event.preventDefault()}
          errorMessage={state?.error?.confirmNewPassword}
        />
      </>
      <Button type="submit" className="w-full" disabled={pending} dataTestId="update-password-submit-button">
        Update Password
      </Button>
    </form>
  )
}
