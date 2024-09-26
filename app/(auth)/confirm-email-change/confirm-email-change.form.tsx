"use client"

import { FormEvent, ReactNode, RefObject, useCallback, useEffect, useRef } from "react"
import { useFormState } from "react-dom"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { CgSpinner } from "react-icons/cg"
import { confirmEmailChange } from "@/app/(auth)/confirm-email-change/confirm-email-change.actions"
import { ConfirmEmailChangeFormErrorMessages } from "@/app/(auth)/confirm-email-change/confirm-email-change.schema"
import AlertMessage from "@/components/ui/AlertMessage"
import Button from "@/components/ui/Button"
import { ROUTE_PROFILE } from "@/constants/routes"

const initialState = {
  success: false,
  message: "",
  error: {} as ConfirmEmailChangeFormErrorMessages
}

export function ConfirmEmailChangeForm(): ReactNode {
  const router: AppRouterInstance = useRouter()
  const searchParams: ReadonlyURLSearchParams = useSearchParams()
  const token: string | null = searchParams.get("token")
  const formRef: RefObject<HTMLFormElement> = useRef<HTMLFormElement>(null)
  const [state, formAction] = useFormState<ApiResponse, FormData>(confirmEmailChange, initialState)

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

  const handleConfirmEmailChange = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const formData: FormData = new FormData(event.currentTarget)
    formAction(formData)
  }

  return (
    <form ref={formRef} className="w-full" noValidate onSubmit={handleConfirmEmailChange}>
      {state.message ? (
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
