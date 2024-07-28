"use client"

import { ReactNode } from "react"
import { useFormState, useFormStatus } from "react-dom"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn, SignInData, SignInErrorMessages } from "@/app/(auth)/sign-in/sign-in.actions"
import { signIn as authSignInWithPasskey } from "@/auth"
import { SocialLoginButtons } from "@/components/SocialLoginButtons"
import AlertMessage from "@/components/ui/AlertMessage"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { ROUTE_SIGN_IN_WITH_MAGIC_LINK } from "@/constants"
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

  const handleSignInWithMagicLink = (): void => {
    router.push(ROUTE_SIGN_IN_WITH_MAGIC_LINK.PATH)
  }

  return (
    <form action={formAction} noValidate className="w-full">
      {!state.success && state.message && <AlertMessage type="error">{state.message}</AlertMessage>}
      <Input
        id="email"
        label="Email"
        autoComplete="email"
        required
        // errorMessage={state.errors?.email}
      />
      <Input
        type="password"
        id="password"
        label="Password"
        autoComplete="current-password"
        required
        // errorMessage={state.errors?.password}
      />
      <div className="flex justify-end mb-2">
        <Link href="/forgot-password">Forgot Password?</Link>
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        Sign In
      </Button>
      <div className="my-4 text-center">
        {"Don't have an account?"} <Link href="/sign-up">Sign Up</Link>
      </div>
      <div className="flex justify-between items-center mt-4 mb-6">
        <hr className="flex-1 mr-4 border border-t-neutral-200" />
        <span className="mx-auto text-gray-600 uppercase">or</span>
        <hr className="flex-1 h-0 ml-4 border border-t-neutral-200" />
      </div>
      <div className="space-y-4">
        <SocialLoginButtons disabled={pending} />
        {/* TODO: Test other login methods */}
        {/* <Button className="w-full" disabled={pending} onClick={handleSignInWithMagicLink}>
          Sign In With Magic Link
        </Button> */}
        {/* {status === "authenticated" ? (
          <Button
            className="w-full"
            disabled={pending}
            onClick={() => authSignInWithPasskey("passkey", { action: "register" })}
          >
            Register New Passkey
          </Button>
        ) : status === "unauthenticated" ? (
          <Button className="w-full" disabled={pending} onClick={() => authSignInWithPasskey("passkey")}>
            Sign In With Passkey
          </Button>
        ) : null} */}
      </div>
    </form>
  )
}
