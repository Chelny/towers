"use client"

import { FormEvent, ReactNode, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Value, ValueError } from "@sinclair/typebox/value"
import {
  ProfileFormValidationErrors,
  ProfilePayload,
  profileSchema,
} from "@/app/(protected)/account/profile/profile.schema"
import AlertMessage from "@/components/ui/AlertMessage"
import Button from "@/components/ui/Button"
import Calendar from "@/components/ui/Calendar"
import Input from "@/components/ui/Input"
import { INITIAL_FORM_STATE } from "@/constants/api"
import { ROUTE_TOWERS } from "@/constants/routes"
import { authClient } from "@/lib/auth-client"
import { Session } from "@/lib/auth-client"

type ProfileFormProps = {
  session: Session | null
}

export function ProfileForm({ session }: ProfileFormProps): ReactNode {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [formState, setFormState] = useState<ApiResponse>(INITIAL_FORM_STATE)
  const [isNewUserSuccess, setIsNewUserSuccess] = useState<boolean>(false)
  const isNewUser: boolean = !session?.user.username

  const handleUpdateUser = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()

    const formData: FormData = new FormData(event.currentTarget)
    const payload: ProfilePayload = {
      name: formData.get("name") as string,
      birthdate: formData.get("birthdate") as string,
      username: formData.get("username") as string,
      image: formData.get("image") as string,
    }

    const errors: ValueError[] = Array.from(Value.Errors(profileSchema, payload))
    const errorMessages: ProfileFormValidationErrors = {}

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
        case "username":
          errorMessages.username = "The username is invalid."
          break
        case "image":
          if (errorMessages.image) {
            errorMessages.image = "The image is invalid."
          }
          break
        default:
          console.error(`Update Profile Action: Unknown error at ${error.path}`)
          break
      }
    }

    if (Object.keys(errorMessages).length > 0) {
      setFormState({
        success: false,
        message: "Validation errors occurred.",
        error: errorMessages,
      })
    } else {
      await authClient.updateUser(
        {
          name: payload.name,
          birthdate: payload.birthdate ? new Date(payload.birthdate) : undefined,
          username: payload.username,
          // image: payload.image ? convertImageToBase64(payload.image) : null,
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
              message: "Your profile has been updated!",
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

  useEffect(() => {
    if (formState?.success) {
      if (isNewUser) {
        setIsNewUserSuccess(true)
        setTimeout(() => {
          router.push(ROUTE_TOWERS.PATH)
        }, 3000)
      }
    }
  }, [formState])

  return (
    <>
      <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
      <form className="w-full" noValidate onSubmit={handleUpdateUser}>
        {formState?.message && (
          <AlertMessage type={formState.success ? "success" : "error"}>
            {formState.message}
            {isNewUserSuccess && " You will be redirected in 3 seconds..."}
          </AlertMessage>
        )}
        {/* <Input
          type="file"
          id="image"
          label="Avatar"
          defaultValue={undefined}
          disabled
          dataTestId="profile-image-input"
          errorMessage={formState?.error?.image}
        />
        <hr className="mt-6 mb-4" /> */}
        <Input
          id="name"
          label="Name"
          placeholder="Enter your name"
          defaultValue={session?.user?.name}
          required
          dataTestId="profile-name-input"
          errorMessage={formState?.error?.name}
        />
        <Calendar
          id="birthdate"
          label="Birthdate"
          maxDate={new Date(new Date().getFullYear() - 13, new Date().getMonth(), new Date().getDate())}
          defaultValue={session?.user?.birthdate ? String(new Date(session?.user?.birthdate)) : undefined}
          dataTestId="profile-birthdate-calendar"
          description="You must be at least 13 years old."
          errorMessage={formState?.error?.birthdate}
        />
        <Input
          id="username"
          label="Username"
          placeholder="Enter your username"
          autoComplete="off"
          defaultValue={session?.user?.username}
          required
          dataTestId="profile-username-input"
          description="Username must be between 5 and 16 characters long and can contain digits, periods, and underscores."
          errorMessage={formState?.error?.username}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isNewUser ? "Complete Registration" : "Update Profile"}
        </Button>
      </form>
    </>
  )
}
