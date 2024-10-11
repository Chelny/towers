"use client"

import { FormEvent, ReactNode } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { useRouter } from "next/navigation"
import { signIn as authSignInWithProvider } from "next-auth/react"
import { FaGithub } from "react-icons/fa6"
import { GoPasskeyFill } from "react-icons/go"
import { IoLogoGoogle } from "react-icons/io"
import { PiMagicWandFill } from "react-icons/pi"
import { signIn } from "@/app/(auth)/sign-in/sign-in.actions"
import { SignInFormErrorMessages } from "@/app/(auth)/sign-in/sign-in.schema"
import AlertMessage from "@/components/ui/AlertMessage"
import Anchor from "@/components/ui/Anchor"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import {
  ROUTE_FORGOT_PASSWORD,
  ROUTE_SIGN_IN_WITH_MAGIC_LINK,
  ROUTE_SIGN_UP,
  SIGN_IN_REDIRECT
} from "@/constants/routes"
import { useSessionData } from "@/hooks/useSessionData"

const initialState = {
  success: false,
  message: "",
  error: {} as SignInFormErrorMessages
}

export function SignInForm(): ReactNode {
  const router: AppRouterInstance = useRouter()
  const { status } = useSessionData()
  const { pending } = useFormStatus()
  const [state, formAction] = useFormState<ApiResponse, FormData>(signIn, initialState)

  const handleSignIn = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const formData: FormData = new FormData(event.currentTarget)
    formAction(formData)
  }

  const handleSignInWithMagicLink = (): void => {
    router.push(ROUTE_SIGN_IN_WITH_MAGIC_LINK.PATH)
  }

  const handleSignInWithProvider = (provider: "google" | "github"): void => {
    authSignInWithProvider(provider, {
      callbackUrl: SIGN_IN_REDIRECT
    })
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
      <div className="flex justify-end mb-4">
        <Anchor href={ROUTE_FORGOT_PASSWORD.PATH}>Forgot Password?</Anchor>
      </div>
      <Button type="submit" className="w-full" disabled={pending} dataTestId="sign-in-submit-button">
        Sign In
      </Button>
      <div className="my-4 text-center">
        <span>Don’t have an account?</span> <Anchor href={ROUTE_SIGN_UP.PATH}>Sign Up</Anchor>
      </div>
      <div className="flex justify-between items-center mt-4 mb-6">
        <hr className="flex-1 mr-4 border border-t-neutral-200" />
        <span className="mx-auto text-gray-600 uppercase">or</span>
        <hr className="flex-1 h-0 ml-4 border border-t-neutral-200" />
      </div>
      <div className="space-y-4">
        <Button
          className="flex justify-center items-center w-full gap-x-2"
          disabled={pending}
          dataTestId="sign-in-magic-link-button"
          onClick={handleSignInWithMagicLink}
        >
          <PiMagicWandFill className="w-5 h-5" />
          <span>Sign In with Magic Link</span>
        </Button>
        {/* NOTE: The WebAuthn / Passkeys provider is experimental and not yet recommended for production use. */}
        {/* {status === "authenticated" ? (
          <Button
            className="flex justify-center items-center w-full gap-x-2"
            disabled={pending}
            dataTestId="sign-up-passkey-button"
            onClick={() => authSignInWithProvider("passkey", { action: "register" })}
          >
            <GoPasskeyFill className="w-5 h-5" />
            <span>Register New Passkey</span>
          </Button>
        ) : status === "unauthenticated" ? (
          <Button
            className="flex justify-center items-center w-full gap-x-2"
            disabled={pending}
            dataTestId="sign-in-passkey-button"
            onClick={() => authSignInWithProvider("passkey")}
          >
            <GoPasskeyFill className="w-5 h-5" />
            <span>Sign In With Passkey</span>
          </Button>
        ) : null} */}
        <Button
          type="button"
          className="flex justify-center items-center w-full gap-x-2"
          disabled={pending}
          dataTestId="sign-in-github-button"
          onClick={() => handleSignInWithProvider("github")}
        >
          <FaGithub className="w-5 h-5" />
          <span>Sign In with GitHub</span>
        </Button>
        <Button
          type="button"
          className="flex justify-center items-center w-full gap-x-2"
          disabled={pending}
          dataTestId="sign-in-google-button"
          onClick={() => handleSignInWithProvider("google")}
        >
          <IoLogoGoogle className="w-5 h-5" />
          <span>Sign In with Google</span>
        </Button>
      </div>
    </form>
  )
}
