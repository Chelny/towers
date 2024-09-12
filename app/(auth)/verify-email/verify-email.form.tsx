"use client"

import { FormEvent, ReactNode, RefObject, useCallback, useEffect, useRef } from "react"
import { useFormState } from "react-dom"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { CgSpinner } from "react-icons/cg"
import { verifyEmail, VerifyEmailData, VerifyEmailErrorMessages } from "@/app/(auth)/verify-email/verify-email.actions"
import AlertMessage from "@/components/ui/AlertMessage"
import Button from "@/components/ui/Button"
import { ROUTE_SIGN_IN } from "@/constants"

const initialState = {
  success: false,
  message: "",
  errors: {} as VerifyEmailErrorMessages<keyof VerifyEmailData>
}

export function VerifyEmailForm(): ReactNode {
  const router: AppRouterInstance = useRouter()
  const searchParams: ReadonlyURLSearchParams = useSearchParams()
  const email: string | null = searchParams.get("email")
  const token: string | null = searchParams.get("token")
  const formRef: RefObject<HTMLFormElement> = useRef<HTMLFormElement>(null)
  const [state, formAction] = useFormState<any, FormData>(verifyEmail, initialState)

  const handleSubmit = useCallback(() => {
    if (state.success) return
    formRef.current?.requestSubmit()
  }, [state])

  useEffect(() => {
    handleSubmit()
  }, [])

  const handleSignIn = (): void => {
    router.push(ROUTE_SIGN_IN.PATH)
  }

  const handleVerifyEmail = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const formData: FormData = new FormData(event.currentTarget)
    formAction(formData)
  }

  return (
    <form ref={formRef} className="w-full" noValidate onSubmit={handleVerifyEmail}>
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
      <input
        type="hidden"
        id="email"
        name="email"
        value={email ? decodeURIComponent(email) : undefined}
        data-testid="verify-email-email-input"
      />
      <input type="hidden" id="token" name="token" value={token ?? undefined} data-testid="verify-email-token-input" />
    </form>
  )
}
