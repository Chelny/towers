"use client"

import { ClipboardEvent, ReactNode, useActionState, useEffect } from "react"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { cancelAccount } from "@/app/(protected)/account/cancel/cancel.actions"
import { CancelAccountFormValidationErrors } from "@/app/(protected)/account/cancel/cancel.schema"
import AlertMessage from "@/components/ui/AlertMessage"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { ROUTE_SIGN_IN } from "@/constants/routes"

const initialState = {
  success: false,
  message: "",
  error: {} as CancelAccountFormValidationErrors,
}

export function CancelAccountForm(): ReactNode {
  const router: AppRouterInstance = useRouter()
  const [state, formAction, isPending] = useActionState<ApiResponse, FormData>(cancelAccount, initialState)

  useEffect(() => {
    if (state?.success) {
      const timer: NodeJS.Timeout = setTimeout(async () => {
        try {
          await signOut()
          router.push(ROUTE_SIGN_IN.PATH)
        } catch (error) {
          console.error(`CancelAccount deletion - Sign out error: ${error}`)
        }
      }, 15000)

      return () => clearTimeout(timer)
    }
  }, [state, router])

  return (
    <form className="w-full" action={formAction} noValidate>
      {state?.message && <AlertMessage type={state.success ? "success" : "error"}>{state.message}</AlertMessage>}
      <p>
        Please note that canceling your account is a permanent action and cannot be undone. All your data, including
        your profile, settings, and any associated information, will be deleted 30 days after your request is submitted.
        If you sign in within this 30-day period, your account will not be deleted. Please ensure that you remove any
        third-party applications linked to your account after proceeding with the cancellation. If you have any
        questions or need assistance, please contact our support team.
      </p>
      <br />
      <Input
        type="email"
        id="email"
        label="Enter your email to request an account deletion"
        autoComplete="off"
        required
        dataTestId="cancel-account-email-input"
        placeholder="Enter your email"
        errorMessage={state?.error?.email}
        onPaste={(event: ClipboardEvent<HTMLInputElement>) => event.preventDefault()}
      />

      <Button
        type="submit"
        className="mt-4 bg-red-500 text-white"
        disabled={isPending}
        dataTestId="cancel-account-submit-button"
      >
        Confirm Deletion
      </Button>
    </form>
  )
}
