"use client"

import { ReactNode, useEffect } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { Account, Gender, User } from "@prisma/client"
import { profile, ProfileData, ProfileErrorMessages } from "@/app/(protected)/account/profile/profile.actions"
import AlertMessage from "@/components/ui/AlertMessage"
import Button from "@/components/ui/Button"
import Calendar from "@/components/ui/Calendar"
import Input from "@/components/ui/Input"
import RadioButtonGroup from "@/components/ui/RadioButtonGroup"
import { useSessionData } from "@/hooks"

type ProfileProps = {
  user: (Partial<User> & { accounts: Partial<Account>[] }) | null
}

const initialState = {
  success: false,
  message: "",
  errors: {} as ProfileErrorMessages<keyof ProfileData>
}

export function ProfileForm({ user }: ProfileProps): ReactNode {
  const { pending } = useFormStatus()
  const [state, formAction] = useFormState(profile, initialState)
  const { update } = useSessionData()

  useEffect(() => {
    if (state.success) {
      update({
        name: state?.data.name,
        email: state?.data.email,
        username: state?.data.username,
        image: state?.data.image
      })
    }
  }, [state])

  return (
    <form className="w-full" action={formAction} noValidate>
      {state.message && <AlertMessage type={state.success ? "success" : "error"}>{state.message}</AlertMessage>}
      <Input
        id="name"
        label="Name"
        placeholder="Enter your name"
        defaultValue={user?.name}
        required
        errorMessage={state.errors?.name}
      />
      <RadioButtonGroup
        id="gender"
        label="Gender"
        inline
        defaultValue={String(user?.gender)}
        errorMessage={state.errors?.gender}
      >
        <RadioButtonGroup.Option id="male" value={Gender.M} label="Male" />
        <RadioButtonGroup.Option id="female" value={Gender.F} label="Female" />
        <RadioButtonGroup.Option id="other" value={Gender.X} label="Other" />
      </RadioButtonGroup>
      <Calendar
        id="birthdate"
        label="Birthdate"
        maxDate={new Date(new Date().getFullYear() - 12, new Date().getMonth(), new Date().getDate())}
        defaultValue={new Date(user?.birthdate!).toString()}
        description="You must be at least 12 years old."
        errorMessage={state.errors?.birthdate}
      />
      <Input
        type="email"
        id="email"
        label="Email"
        placeholder="Enter your email"
        defaultValue={user?.email}
        required
        readOnly={typeof user?.accounts !== "undefined" && user?.accounts?.length > 0}
        description={
          typeof user?.accounts !== "undefined" && user?.accounts?.length > 0
            ? `Email linked to your account can only be updated through ${user?.accounts[0]?.provider}.`
            : ""
        }
        errorMessage={state.errors?.email}
      />
      <hr className="mt-6 mb-4" />
      <Input
        id="username"
        label="Username"
        placeholder="Enter your username"
        autoComplete="off"
        defaultValue={user?.username}
        required
        description="Username must be between 5 and 16 characters long and can contain digits, periods, and underscores."
        errorMessage={state.errors?.username}
      />
      <Button type="submit" className="w-full" disabled={pending}>
        Update
      </Button>
    </form>
  )
}
