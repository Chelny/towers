"use client"

import { ReactNode, RefObject, useActionState, useCallback, useEffect, useRef } from "react"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { CgSpinner } from "react-icons/cg"
import { verifyEmail } from "@/app/(auth)/verify-email/verify-email.actions"
import { VerifyEmailFormValidationErrors } from "@/app/(auth)/verify-email/verify-email.schema"
import AlertMessage from "@/components/ui/AlertMessage"
import Button from "@/components/ui/Button"
import { ROUTE_SIGN_IN } from "@/constants/routes"

const initialState = {
  success: false,
  message: "",
  error: {} as VerifyEmailFormValidationErrors,
}

export function VerifyEmailForm(): ReactNode {
  const router: AppRouterInstance = useRouter()
  const searchParams: ReadonlyURLSearchParams = useSearchParams()
  const token: string | null = searchParams.get("token")
  const formRef: RefObject<HTMLFormElement | null> = useRef<HTMLFormElement | null>(null)
  const [state, formAction] = useActionState<ApiResponse, FormData>(verifyEmail, initialState)

  const handleSubmit = useCallback(() => {
    if (state?.success) return
    formRef.current?.requestSubmit()
  }, [state])

  useEffect(() => {
    handleSubmit()
  }, [])

  const handleSignIn = (): void => {
    router.push(ROUTE_SIGN_IN.PATH)
  }

  return (
    <form ref={formRef} className="w-full" action={formAction} noValidate>
      {state.message ? (
        <>
          <AlertMessage type={state.success ? "success" : "error"}>{state.message}</AlertMessage>
          {state.success && (
            <div className="flex justify-center mt-8">
              <Button dataTestId="verify-email-sign-in-button" onClick={handleSignIn}>
                Sign In
              </Button>
            </div>
          )}
        </>
      ) : (
        <CgSpinner className="w-12 h-12 mx-auto animate-spin" data-testid="verify-email-spinner-icon" />
      )}
      <input type="hidden" id="token" name="token" value={token ?? undefined} data-testid="verify-email-token-input" />
    </form>
  )
}
