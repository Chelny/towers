"use client"

import { ClipboardEvent, FormEvent, ReactNode, useState } from "react"
import { ValueError } from "@sinclair/typebox/errors"
import { Value } from "@sinclair/typebox/value"
import { SignUpFormValidationErrors, SignUpPayload, signUpSchema } from "@/app/(auth)/sign-up/sign-up.schema"
import AlertMessage from "@/components/ui/AlertMessage"
import Anchor from "@/components/ui/Anchor"
import Button from "@/components/ui/Button"
import Calendar from "@/components/ui/Calendar"
import Checkbox from "@/components/ui/Checkbox"
import Input from "@/components/ui/Input"
import { INITIAL_FORM_STATE } from "@/constants/api"
import { REDIRECT_URI, ROUTE_SIGN_IN } from "@/constants/routes"
import { authClient } from "@/lib/auth-client"

export function SignUpForm(): ReactNode {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [formState, setFormState] = useState<ApiResponse>(INITIAL_FORM_STATE)

  const handleSignUp = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()

    const formData: FormData = new FormData(event.currentTarget)
    const payload: SignUpPayload = {
      name: formData.get("name") as string,
      birthdate: formData.get("birthdate") as string,
      email: formData.get("email") as string,
      username: formData.get("username") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
      termsAndConditions: formData.get("termsAndConditions") === "on",
    }

    const errors: ValueError[] = Array.from(Value.Errors(signUpSchema, payload))
    const errorMessages: SignUpFormValidationErrors = {}

    for (const error of errors) {
      switch (error.path.replace("/", "")) {
        case "name":
          errorMessages.name = "The name is invalid."
          break
        case "birthdate":
          if (payload.birthdate) {
            errorMessages.birthdate = "The birthdate is invalid."
          }
          break
        case "email":
          errorMessages.email = "The email is invalid."
          break
        case "username":
          errorMessages.username = "The username is invalid."
          break
        case "password":
          errorMessages.password = "The password is invalid."
          break
        case "confirmPassword":
          errorMessages.confirmPassword = "The password confirmation is invalid."
          break
        case "termsAndConditions":
          errorMessages.termsAndConditions = "You must accept the terms and conditions."
          break
        default:
          console.error(`Sign Up Action: Unknown error at ${error.path}`)
          break
      }
    }

    if (payload.password !== payload.confirmPassword) {
      errorMessages.confirmPassword = "The password and password confirmation do not match."
    }

    if (Object.keys(errorMessages).length > 0) {
      setFormState({
        success: false,
        message: "Validation errors occurred.",
        error: errorMessages,
      })
    } else {
      await authClient.signUp.email(
        {
          name: payload.name,
          birthdate: payload.birthdate ? new Date(payload.birthdate) : undefined,
          email: payload.email,
          username: payload.username,
          password: payload.password,
          // image: payload.image ? convertImageToBase64(payload.image) : null,
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
              message: `A confirmation email has been sent to ${payload.email}. If you don’t see it in your inbox, please check your spam or junk folder.`,
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

  return (
    <form className="w-full" noValidate data-testid="sign-up-form" onSubmit={handleSignUp}>
      <p className="mb-4">
        Already have an account?{" "}
        <Anchor href={ROUTE_SIGN_IN.PATH} dataTestId="sign-up-sign-in-link">
          Sign In
        </Anchor>
      </p>
      {formState?.message && (
        <AlertMessage type={formState.success ? "success" : "error"}>{formState.message}</AlertMessage>
      )}
      <Input
        id="name"
        label="Name"
        placeholder="Enter your name"
        required
        dataTestId="sign-up-name-input"
        errorMessage={formState?.error?.name}
      />
      <Calendar
        id="birthdate"
        label="Birthdate"
        maxDate={new Date(new Date().getFullYear() - 13, new Date().getMonth(), new Date().getDate())}
        dataTestId="sign-up-birthdate-calendar"
        description="You must be at least 13 years old."
        errorMessage={formState?.error?.birthdate}
      />
      <Input
        type="email"
        id="email"
        label="Email"
        placeholder="Enter your email"
        required
        dataTestId="sign-up-email-input"
        onPaste={(event: ClipboardEvent<HTMLInputElement>) => event.preventDefault()}
        errorMessage={formState?.error?.email}
      />
      <hr className="mt-6 mb-4" />
      <Input
        id="username"
        label="Username"
        placeholder="Enter your username"
        autoComplete="off"
        required
        dataTestId="sign-up-username-input"
        description="Username must be between 5 and 16 characters long and can contain digits, periods, and underscores."
        errorMessage={formState?.error?.username}
      />
      <Input
        type="password"
        id="password"
        label="Password"
        autoComplete="off"
        required
        dataTestId="sign-up-password-input"
        description="Password must be at least 8 characters long, must contain at least one digit, one uppercase letter, and at least one special character."
        errorMessage={formState?.error?.password}
      />
      <Input
        type="password"
        id="confirmPassword"
        label="Confirm Password"
        autoComplete="off"
        required
        dataTestId="sign-up-confirm-password-input"
        onPaste={(event: ClipboardEvent<HTMLInputElement>) => event.preventDefault()}
        errorMessage={formState?.error?.confirmPassword}
      />
      <Checkbox
        id="termsAndConditions"
        label="I agree to the terms and conditions."
        required
        dataTestId="sign-up-terms-and-conditions-checkbox"
        errorMessage={formState?.error?.termsAndConditions}
      />
      <Button type="submit" className="w-full" disabled={isLoading || formState.success}>
        Sign Up
      </Button>
    </form>
  )
}
