"use client"

import { ReactNode, RefObject, useActionState, useCallback, useEffect, useRef } from "react"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { CgSpinner } from "react-icons/cg"
import { confirmEmailChange } from "@/app/(auth)/confirm-email-change/confirm-email-change.actions"
import { ConfirmEmailChangeFormValidationErrors } from "@/app/(auth)/confirm-email-change/confirm-email-change.schema"
import AlertMessage from "@/components/ui/AlertMessage"
import Button from "@/components/ui/Button"
import { ROUTE_PROFILE } from "@/constants/routes"

const initialState = {
  success: false,
  message: "",
  error: {} as ConfirmEmailChangeFormValidationErrors,
}

export function ConfirmEmailChangeForm(): ReactNode {
  const router: AppRouterInstance = useRouter()
  const searchParams: ReadonlyURLSearchParams = useSearchParams()
  const token: string | null = searchParams.get("token")
  const formRef: RefObject<HTMLFormElement | null> = useRef<HTMLFormElement | null>(null)
  const [state, formAction, isPending] = useActionState<ApiResponse, FormData>(confirmEmailChange, initialState)

  const handleSubmit = useCallback(() => {
    if (state?.success) return
    formRef.current?.requestSubmit()
  }, [state])

  useEffect(() => {
    handleSubmit()
  }, [])

  const handleBackToProfile = (): void => {
    router.push(ROUTE_PROFILE.PATH)
  }

  return (
    <form ref={formRef} className="w-full" action={formAction} noValidate>
      {!isPending && state.message ? (
        <>
          <AlertMessage type={state.success ? "success" : "error"}>{state.message}</AlertMessage>
          {state.success && (
            <div className="flex justify-center mt-8">
              <Button dataTestId="confirm-email-change-profile-button" onClick={handleBackToProfile}>
                Back to profile
              </Button>
            </div>
          )}
        </>
      ) : (
        <CgSpinner className="w-12 h-12 mx-auto animate-spin" data-testid="confirm-email-change-spinner-icon" />
      )}
      <input
        type="hidden"
        id="token"
        name="token"
        value={token ?? undefined}
        data-testid="confirm-email-change-token-input"
      />
    </form>
  )
}
