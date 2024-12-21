"use client"

import { FormEvent, ReactNode, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ValueError } from "@sinclair/typebox/errors"
import { Value } from "@sinclair/typebox/value"
import { PiMagicWandFill } from "react-icons/pi"
import { SignInFormValidationErrors, SignInPayload, signInSchema } from "@/app/(auth)/sign-in/sign-in.schema"
import AlertMessage from "@/components/ui/AlertMessage"
import Anchor from "@/components/ui/Anchor"
import Button from "@/components/ui/Button"
import Checkbox from "@/components/ui/Checkbox"
import Input from "@/components/ui/Input"
import { INITIAL_FORM_STATE } from "@/constants/api"
import { AUTH_PROVIDERS } from "@/constants/auth-providers"
import {
  ERROR_REDIRECT_URI,
  REDIRECT_URI,
  ROUTE_FORGOT_PASSWORD,
  ROUTE_SIGN_IN_WITH_MAGIC_LINK,
  ROUTE_SIGN_UP,
} from "@/constants/routes"
import { authClient } from "@/lib/auth-client"
import { AuthProvider, AuthProviderDetails } from "@/lib/providers"

export function SignInForm(): ReactNode {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [formState, setFormState] = useState<ApiResponse>(INITIAL_FORM_STATE)

  const checkWebAuthnSupport = async (): Promise<void> => {
    const isWebAuthnAvailable: boolean =
      typeof PublicKeyCredential !== "undefined" &&
      typeof PublicKeyCredential.isConditionalMediationAvailable === "function"

    if (isWebAuthnAvailable) {
      const isAuthenticatorAvailable: boolean =
        await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()

      if (isAuthenticatorAvailable) {
        await authClient.signIn.passkey({ autoFill: true })
        console.info("Passkey sign-in initiated.")
      } else {
        console.warn("Passkeys are not supported on this device.")
      }
    } else {
      console.warn("WebAuthn is not supported in this browser.")
    }
  }

  const handleSignIn = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()

    const formData: FormData = new FormData(event.currentTarget)
    const payload: SignInPayload = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      rememberMe: formData.get("rememberMe") === "on",
    }

    const errors: ValueError[] = Array.from(Value.Errors(signInSchema, payload))
    const errorMessages: SignInFormValidationErrors = {}

    for (const error of errors) {
      switch (error.path.replace("/", "")) {
        case "email":
          errorMessages.email = "The email is invalid."
          break
        case "password":
          errorMessages.password = "The password is invalid."
          break
        default:
          console.error(`Sign In Action: Unknown error at ${error.path}`)
          break
      }
    }

    if (Object.keys(errorMessages).length > 0) {
      setFormState({
        success: false,
        message: "The email or the password is invalid.",
        error: errorMessages,
      })
    } else {
      await authClient.signIn.email(
        {
          email: payload.email,
          password: payload.password,
          rememberMe: payload.rememberMe,
          callbackURL: REDIRECT_URI,
        },
        {
          onRequest: () => {
            setIsLoading(true)
            setFormState(INITIAL_FORM_STATE)
          },
          onSuccess: () => {
            setIsLoading(false)
            setFormState({
              success: true,
              message: "You’re successfully signed in. Welcome back!",
            })
          },
          onError: (ctx) => {
            setIsLoading(false)
            setFormState({
              success: false,
              message: ctx.error.message,
            })
          },
        },
      )
    }
  }

  const handleSignInWithMagicLink = (): void => router.push(ROUTE_SIGN_IN_WITH_MAGIC_LINK.PATH)

  const handleSignInWithProvider = async (provider: AuthProvider): Promise<void> => {
    await authClient.signIn.social(
      {
        provider: provider,
        callbackURL: REDIRECT_URI,
        errorCallbackURL: ERROR_REDIRECT_URI,
      },
      {
        onRequest: () => {
          setIsLoading(true)
          setFormState(INITIAL_FORM_STATE)
        },
        onSuccess: () => {
          setIsLoading(false)
          setFormState({
            success: true,
            message: "You’re successfully signed in. Welcome back!",
          })
        },
        onError: (ctx) => {
          setIsLoading(false)
          setFormState({
            success: false,
            message: ctx.error.message,
          })
        },
      },
    )
  }

  useEffect(() => {
    checkWebAuthnSupport()
  }, [])

  return (
    <form className="w-full" noValidate onSubmit={handleSignIn}>
      {!formState.success && formState.message && <AlertMessage type="error">{formState.message}</AlertMessage>}
      <Input id="email" label="Email" autoComplete="username webauthn" required dataTestId="sign-in-email-input" />
      <Input
        type="password"
        id="password"
        label="Password"
        autoComplete="current-password webauthn"
        required
        dataTestId="sign-in-password-input"
      />
      <div className="flex items-center">
        <div className="flex-1">
          <Checkbox
            id="rememberMe"
            label="Remember me"
            defaultChecked={true}
            dataTestId="sign-in-remember-me-checkbox"
          />
        </div>
        <div className="flex-1 mb-3 text-end">
          <Anchor href={ROUTE_FORGOT_PASSWORD.PATH} dataTestId="sign-in-forgot-password-link">
            Forgot Password?
          </Anchor>
        </div>
      </div>
      <Button type="submit" className="w-full" aria-label="Sign in with email and password" disabled={isLoading}>
        Sign In
      </Button>
      <div className="my-4 text-center">
        <span>Don’t have an account?</span>{" "}
        <Anchor href={ROUTE_SIGN_UP.PATH} dataTestId="sign-in-sign-up-link">
          Sign Up
        </Anchor>
      </div>
      <div className="flex justify-between items-center mt-4 mb-6" role="separator">
        <hr className="flex-1 mr-4 border border-t-neutral-200" />
        <span className="mx-auto text-gray-600 text-sm uppercase">or sign in with</span>
        <hr className="flex-1 h-0 ml-4 border border-t-neutral-200" />
      </div>
      <div className="space-y-4">
        <Button
          className="flex justify-center items-center w-full gap-x-2"
          disabled={isLoading}
          onClick={handleSignInWithMagicLink}
        >
          <PiMagicWandFill className="w-5 h-5" aria-hidden="true" />
          <span>Magic Link</span>
        </Button>
        {AUTH_PROVIDERS.map(({ name, label, icon }: AuthProviderDetails) => (
          <Button
            key={name}
            type="button"
            className="flex justify-center items-center gap-2 w-full"
            disabled={isLoading}
            aria-label={`Sign in with ${label}`}
            onClick={() => handleSignInWithProvider(name)}
          >
            {icon}
            <span>{label}</span>
          </Button>
        ))}
      </div>
    </form>
  )
}
