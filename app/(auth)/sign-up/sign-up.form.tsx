"use client"

import { ClipboardEvent, FormEvent, ReactNode } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { signUp } from "@/app/(auth)/sign-up/sign-up.actions"
import { SignUpFormErrorMessages } from "@/app/(auth)/sign-up/sign-up.schema"
import AlertMessage from "@/components/ui/AlertMessage"
import Button from "@/components/ui/Button"
import Calendar from "@/components/ui/Calendar"
import Checkbox from "@/components/ui/Checkbox"
import Input from "@/components/ui/Input"

const initialState = {
  success: false,
  message: "",
  error: {} as SignUpFormErrorMessages
}

export function SignUpForm(): ReactNode {
  const { pending } = useFormStatus()
  const [state, formAction] = useFormState<ApiResponse, FormData>(signUp, initialState)

  const handleSignUp = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const formData: FormData = new FormData(event.currentTarget)
    formAction(formData)
  }

  return (
    <form className="w-full" noValidate onSubmit={handleSignUp}>
      {state?.message && <AlertMessage type={state.success ? "success" : "error"}>{state.message}</AlertMessage>}
      <Input
        id="name"
        label="Name"
        placeholder="Enter your name"
        required
        dataTestId="sign-up-name-input"
        errorMessage={state?.error?.name}
      />
      <Calendar
        id="birthdate"
        label="Birthdate"
        maxDate={new Date(new Date().getFullYear() - 13, new Date().getMonth(), new Date().getDate())}
        dataTestId="sign-up-birthdate-calendar"
        description="You must be at least 13 years old."
        errorMessage={state?.error?.birthdate}
      />
      <Input
        type="email"
        id="email"
        label="Email"
        placeholder="Enter your email"
        required
        dataTestId="sign-up-email-input"
        onPaste={(event: ClipboardEvent<HTMLInputElement>) => event.preventDefault()}
        errorMessage={state?.error?.email}
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
        errorMessage={state?.error?.username}
      />
      <Input
        type="password"
        id="password"
        label="Password"
        autoComplete="off"
        required
        dataTestId="sign-up-password-input"
        description="Password must be at least 8 characters long, must contain at least one digit, one uppercase letter, and at least one special character."
        errorMessage={state?.error?.password}
      />
      <Input
        type="password"
        id="confirmPassword"
        label="Confirm Password"
        autoComplete="off"
        required
        dataTestId="sign-up-confirm-password-input"
        onPaste={(event: ClipboardEvent<HTMLInputElement>) => event.preventDefault()}
        errorMessage={state?.error?.confirmPassword}
      />
      <Checkbox
        id="termsAndConditions"
        label="I agree to the terms and conditions."
        required
        dataTestId="sign-up-terms-and-conditions-checkbox"
        errorMessage={state?.error?.termsAndConditions}
      />
      <Button type="submit" className="w-full" disabled={pending || state.success} dataTestId="sign-up-submit-button">
        Sign Up
      </Button>
    </form>
  )
}
