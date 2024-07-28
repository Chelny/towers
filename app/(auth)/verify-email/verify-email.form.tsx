"use client"

import { ReactNode, useCallback, useEffect, useRef } from "react"
import { useFormState } from "react-dom"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CgSpinner } from "react-icons/cg"
import { verifyEmail, VerifyEmailData, VerifyEmailErrorMessages } from "@/app/(auth)/verify-email/verify-email.actions"
import AlertMessage from "@/components/ui/AlertMessage"
import { ROUTE_SIGN_IN } from "@/constants"

const initialState = {
  success: false,
  message: "",
  errors: {} as VerifyEmailErrorMessages<keyof VerifyEmailData>
}

export function VerifyEmailForm(): ReactNode {
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  const token = searchParams.get("token")
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction] = useFormState(verifyEmail, initialState)

  const handleSubmit = useCallback(() => {
    if (state.success) return
    formRef.current?.requestSubmit()
  }, [state.success])

  useEffect(() => {
    handleSubmit()
  }, [])

  return (
    <form ref={formRef} action={formAction} noValidate className="w-fit">
      {state.message ? (
        <AlertMessage type={state.success ? "success" : "error"}>{state.message}</AlertMessage>
      ) : (
        <CgSpinner className="w-12 h-12 mx-auto animate-spin" />
      )}
      <input type="hidden" id="email" name="email" value={email ? decodeURIComponent(email) : undefined} />
      <input type="hidden" id="token" name="token" value={token ?? undefined} />
      <div className="mt-8 text-center">
        <Link href={ROUTE_SIGN_IN.PATH}>Sign In</Link>
      </div>
    </form>
  )
}
