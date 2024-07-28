"use client"

import { ReactNode, useRef } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { signUp, SignUpData, SignUpErrorMessages } from "@/app/(auth)/sign-up/sign-up.actions"
import AlertMessage from "@/components/ui/AlertMessage"
import Button from "@/components/ui/Button"
import Calendar from "@/components/ui/Calendar"
import Input from "@/components/ui/Input"
import RadioButtonGroup from "@/components/ui/RadioButtonGroup"

const initialState = {
  success: false,
  message: "",
  errors: {} as SignUpErrorMessages<keyof SignUpData>
}

export function SignUpForm(): ReactNode {
  const formRef = useRef<HTMLFormElement>(null)
  const { pending } = useFormStatus()
  const [state, formAction] = useFormState(signUp, initialState)

  return (
    <form ref={formRef} action={formAction} noValidate className="w-full">
      {state.message && <AlertMessage type={state.success ? "success" : "error"}>{state.message}</AlertMessage>}
      <Input id="name" label="Name" placeholder="Enter your name" required errorMessage={state.errors?.name} />
      <RadioButtonGroup id="gender" label="Gender" inline errorMessage={state.errors?.gender}>
        <RadioButtonGroup.Option id="male" value="M" label="Male" />
        <RadioButtonGroup.Option id="female" value="F" label="Female" />
        <RadioButtonGroup.Option id="other" value="X" label="Other" />
      </RadioButtonGroup>
      <Calendar
        id="birthdate"
        label="Birthdate"
        maxDate={new Date(new Date().getFullYear() - 12, new Date().getMonth(), new Date().getDate())}
        errorMessage={state.errors?.birthdate}
        description="You must be at least 12 years old."
      />
      <Input
        type="email"
        id="email"
        label="Email"
        placeholder="Enter your email"
        required
        errorMessage={state.errors?.email}
      />
      <hr className="my-4" />
      <Input
        id="username"
        label="Username"
        placeholder="Enter your username"
        autoComplete="username"
        required
        errorMessage={state.errors?.username}
        description="Username must be between 5 and 16 characters long and can contain digits, periods, and underscores."
      />
      <Input
        type="password"
        id="password"
        label="Password"
        autoComplete="new-password"
        required
        description="Password must be at least 8 characters long, must contain at least one digit, one uppercase letter, and at least one special character."
        errorMessage={state.errors?.password}
      />
      <Input
        type="password"
        id="confirmPassword"
        label="Confirm Password"
        autoComplete="new-password"
        required
        errorMessage={state.errors?.confirmPassword}
      />
      <Button type="submit" className="w-full" disabled={pending}>
        Sign Up
      </Button>
    </form>
  )
}
