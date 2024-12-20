"use client"

import { ClipboardEvent, FormEvent, ReactNode, useState } from "react"
import { Value, ValueError } from "@sinclair/typebox/value"
import { IoWarning } from "react-icons/io5"
import {
  ChangeEmailFormValidationErrors,
  ChangeEmailPayload,
  changeEmailSchema,
} from "@/app/(protected)/account/profile/change-email.schema"
import AlertMessage from "@/components/ui/AlertMessage"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { INITIAL_FORM_STATE } from "@/constants/api"
import { authClient } from "@/lib/auth-client"
import { Session } from "@/lib/auth-client"

type ChangeEmailFormProps = {
  session: Session | null
}

export function ChangeEmailForm({ session }: ChangeEmailFormProps): ReactNode {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [formState, setFormState] = useState<ApiResponse>(INITIAL_FORM_STATE)

  const handleChangeEmail = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()

    const formData: FormData = new FormData(event.currentTarget)
    const payload: ChangeEmailPayload = {
      email: formData.get("email") as string,
    }

    const errors: ValueError[] = Array.from(Value.Errors(changeEmailSchema, payload))
    const errorMessages: ChangeEmailFormValidationErrors = {}

    for (const error of errors) {
      switch (error.path.replace("/", "")) {
        case "email":
          errorMessages.email = "The email is invalid."
          break
        default:
          console.error(`Change Email Action: Unknown error at ${error.path}`)
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
      await authClient.changeEmail(
        {
          newEmail: payload.email,
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
              message:
                "A verification email has been sent to your new email address. Please check your inbox or your spam folder.",
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

  const handleSendVerificationEmail = async (): Promise<void> => {
    if (session?.user.email) {
      await authClient.sendVerificationEmail(
        {
          email: session?.user.email,
        },
        {
          onRequest: () => {
            setIsLoading(true)
            setFormState(INITIAL_FORM_STATE)
          },
          onSuccess: (ctx) => {
            setIsLoading(false)
            setFormState({
              success: true,
              message:
                "A verification email has been sent to your new email address. Please check your inbox or your spam folder.",
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
    <>
      <h3 className="text-lg font-semibold mb-4">Change Email</h3>
      <form className="w-full" noValidate onSubmit={handleChangeEmail}>
        {formState?.message && (
          <AlertMessage type={formState.success ? "success" : "error"}>{formState.message}</AlertMessage>
        )}
        <Input
          type="email"
          id="email"
          label="Email"
          placeholder="Enter your email"
          defaultValue={session?.user?.email}
          required
          dataTestId="profile-email-input"
          onPaste={(event: ClipboardEvent<HTMLInputElement>) => event.preventDefault()}
          errorMessage={formState?.error?.email}
        />
        {!session?.user.emailVerified && (
          <div className="flex items-center gap-2 mb-3">
            <IoWarning className="w-8 h-8 text-amber-500" />
            <div>
              <span className="font-medium">Email not verified.</span> Please verify your email to continue.{" "}
              <button type="button" className="towers-link" onClick={handleSendVerificationEmail}>
                Resend verification
              </button>
            </div>
          </div>
        )}
        <Button type="submit" className="w-full" disabled={isLoading}>
          Send Verification Email
        </Button>
      </form>
    </>
  )
}
