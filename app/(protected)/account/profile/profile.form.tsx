"use client"

import { ClipboardEvent, FormEvent, ReactNode, useEffect, useState } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"
import { Account, User, UserStatus } from "@prisma/client"
import axios from "axios"
import { IoWarning } from "react-icons/io5"
import { profile } from "@/app/(protected)/account/profile/profile.actions"
import { ProfileFormErrorMessages } from "@/app/(protected)/account/profile/profile.schema"
import AlertMessage from "@/components/ui/AlertMessage"
import Button from "@/components/ui/Button"
import Calendar from "@/components/ui/Calendar"
import Input from "@/components/ui/Input"
import { ROUTE_TOWERS } from "@/constants/routes"
import { useSessionData } from "@/hooks/useSessionData"

type ProfileProps = {
  user: (Partial<User> & { accounts: Partial<Account>[] }) | null
  isNewUser?: boolean
}

const initialState = {
  success: false,
  message: "",
  error: {} as ProfileFormErrorMessages
}

export function ProfileForm({ user, isNewUser }: ProfileProps): ReactNode {
  const router = useRouter()
  const { pending } = useFormStatus()
  const [state, formAction] = useFormState<ApiResponse<User>, FormData>(profile, initialState)
  const { update } = useSessionData()
  const [isNewUserSuccess, setIsNewUserSuccess] = useState<boolean>(false)

  useEffect(() => {
    if (state?.success) {
      if (state?.data) {
        update({
          name: state?.data?.name,
          email: state?.data?.email,
          username: state?.data?.username,
          image: state?.data?.image
        })
      }

      if (isNewUser) {
        setIsNewUserSuccess(true)
        setTimeout(() => {
          router.push(ROUTE_TOWERS.PATH)
        }, 5000)
      }
    }
  }, [state])

  const handleUpdateProfile = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const formData: FormData = new FormData(event.currentTarget)
    formAction(formData)
  }

  const handleResendVerification = async (): Promise<void> => {
    await axios.post("/api/send-email-verification", { user })
  }

  return (
    <form className="w-full" noValidate onSubmit={handleUpdateProfile}>
      {state?.message && (
        <AlertMessage type={state.success ? "success" : "error"}>
          {state.message}
          {isNewUserSuccess && " You will be redirected in 5 seconds..."}
        </AlertMessage>
      )}
      {/* <Input
        type="file"
        id="image"
        label="Avatar"
        defaultValue={undefined}
        disabled
        dataTestId="profile-image-input"
        errorMessage={state?.error?.image}
      />
      <hr className="mt-6 mb-4" /> */}
      <Input
        id="name"
        label="Name"
        placeholder="Enter your name"
        defaultValue={user?.name}
        required
        dataTestId="profile-name-input"
        errorMessage={state?.error?.name}
      />
      <Calendar
        id="birthdate"
        label="Birthdate"
        maxDate={new Date(new Date().getFullYear() - 13, new Date().getMonth(), new Date().getDate())}
        defaultValue={user?.birthdate ? String(new Date(user?.birthdate)) : undefined}
        dataTestId="profile-birthdate-calendar"
        description="You must be at least 13 years old."
        errorMessage={state?.error?.birthdate}
      />
      <Input
        type="email"
        id="email"
        label="Email"
        placeholder="Enter your email"
        defaultValue={user?.pendingEmail || user?.email}
        required
        readOnly={typeof user?.accounts !== "undefined" && user?.accounts?.length > 0}
        dataTestId="profile-email-input"
        onPaste={(event: ClipboardEvent<HTMLInputElement>) => event.preventDefault()}
        description={
          typeof user?.accounts !== "undefined" && user?.accounts?.length > 0
            ? `Email linked to your account can only be updated through ${user?.accounts[0]?.provider}.`
            : ""
        }
        errorMessage={state?.error?.email}
      />
      {user?.status === UserStatus.PENDING_EMAIL_VERIFICATION && (
        <div className="flex items-center gap-2 font-medium">
          <IoWarning className="w-5 h-5 text-amber-500" />
          <div>
            Email not verified.{" "}
            <button className="towers-link" onClick={handleResendVerification}>
              Resend verification
            </button>
          </div>
        </div>
      )}
      <hr className="mt-6 mb-4" />
      <Input
        id="username"
        label="Username"
        placeholder="Enter your username"
        autoComplete="off"
        defaultValue={user?.username}
        required
        dataTestId="profile-username-input"
        description="Username must be between 5 and 16 characters long and can contain digits, periods, and underscores."
        errorMessage={state?.error?.username}
      />
      <Button type="submit" className="w-full" disabled={pending} dataTestId="profile-submit-button">
        {isNewUser ? "Complete Registration" : "Update Profile"}
      </Button>
    </form>
  )
}
