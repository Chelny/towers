"use client"

import { ReactNode, useCallback, useEffect, useRef } from "react"
import { useFormState } from "react-dom"
import { useSearchParams } from "next/navigation"
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  const token = searchParams.get("token")
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction] = useFormState(verifyEmail, initialState)

  useEffect(() => {
    handleSubmit()
  }, [])

  const handleSubmit = useCallback(() => {
    if (state.success) return
    formRef.current?.requestSubmit()
  }, [state])

  const handleSignIn = (): void => {
    router.push(ROUTE_SIGN_IN.PATH)
  }

  return (
    <form ref={formRef} className="w-full" action={formAction} noValidate>
      {state.message ? (
        <AlertMessage type={state.success ? "success" : "error"}>{state.message}</AlertMessage>
      ) : (
        <CgSpinner className="w-12 h-12 mx-auto animate-spin" />
      )}
      <input type="hidden" id="email" name="email" value={email ? decodeURIComponent(email) : undefined} />
      <input type="hidden" id="token" name="token" value={token ?? undefined} />
      <div className="flex justify-center mt-8">
        <Button onClick={handleSignIn}>Sign In</Button>
      </div>
    </form>
  )
}
