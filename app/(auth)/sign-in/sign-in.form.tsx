"use client"

import { FormEvent, ReactNode } from "react"
import { useFormState, useFormStatus } from "react-dom"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn, SignInData, SignInErrorMessages } from "@/app/(auth)/sign-in/sign-in.actions"
import { signIn as authSignInWithPasskey } from "@/auth"
import { SocialLoginButtons } from "@/components/SocialLoginButtons"
import AlertMessage from "@/components/ui/AlertMessage"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { ROUTE_FORGOT_PASSWORD, ROUTE_SIGN_IN_WITH_MAGIC_LINK, ROUTE_SIGN_UP } from "@/constants"
import { useSessionData } from "@/hooks"

const initialState = {
  success: false,
  message: "",
  errors: {} as SignInErrorMessages<keyof SignInData>
}

export function SignInForm(): ReactNode {
  const router = useRouter()
  const { status } = useSessionData()
  const { pending } = useFormStatus()
  const [state, formAction] = useFormState(signIn, initialState)

  const handleSignIn = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const formData: FormData = new FormData(event.currentTarget)
    formAction(formData)
  }

  const handleSignInWithMagicLink = (): void => {
    router.push(ROUTE_SIGN_IN_WITH_MAGIC_LINK.PATH)
  }

  return (
    <form className="w-full" noValidate onSubmit={handleSignIn}>
      {!state.success && state.message && <AlertMessage type="error">{state.message}</AlertMessage>}
      <Input id="email" label="Email" autoComplete="email" required dataTestId="sign-in-email-input" />
      <Input
        type="password"
        id="password"
        label="Password"
        autoComplete="current-password"
        required
        dataTestId="sign-in-password-input"
      />
      <div className="flex justify-end mb-2">
        <Link href={ROUTE_FORGOT_PASSWORD.PATH}>Forgot Password?</Link>
      </div>
      <Button type="submit" className="w-full" disabled={pending} dataTestId="sign-in-submit-button">
        Sign In
      </Button>
      <div className="my-4 text-center">
        {"Don't have an account?"} <Link href={ROUTE_SIGN_UP.PATH}>Sign Up</Link>
      </div>
      <div className="flex justify-between items-center mt-4 mb-6">
        <hr className="flex-1 mr-4 border border-t-neutral-200" />
        <span className="mx-auto text-gray-600 uppercase">or</span>
        <hr className="flex-1 h-0 ml-4 border border-t-neutral-200" />
      </div>
      <div className="space-y-4">
        <SocialLoginButtons disabled={pending} />
        {/* TODO: Test other login methods + Update related test suites */}
        {/* <Button
          className="w-full"
          disabled={pending}
          dataTestId="sign-in-magic-link-button"
          onClick={handleSignInWithMagicLink}
        >
          Sign In With Magic Link
        </Button> */}
        {/* {status === "authenticated" ? (
          <Button
            className="w-full"
            disabled={pending}
            dataTestId="sign-up-passkey-button"
            onClick={() => authSignInWithPasskey("passkey", { action: "register" })}
          >
            Register New Passkey
          </Button>
        ) : status === "unauthenticated" ? (
          <Button
            className="w-full"
            disabled={pending}
            dataTestId="sign-in-passkey-button"
            onClick={() => authSignInWithPasskey("passkey")}
          >
            Sign In With Passkey
          </Button>
        ) : null} */}
      </div>
    </form>
  )
}
