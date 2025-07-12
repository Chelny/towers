"use client"

import { FormEvent, ReactNode, useState } from "react"
import { ErrorContext } from "@better-fetch/fetch"
import { Trans, useLingui } from "@lingui/react/macro"
import { Value, ValueError } from "@sinclair/typebox/value"
import {
  ForgotPasswordErrorMessages,
  ForgotPasswordPayload,
  forgotPasswordSchema,
} from "@/app/[locale]/(auth)/forgot-password/forgot-password.schema"
import AlertMessage from "@/components/ui/AlertMessage"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { INITIAL_FORM_STATE } from "@/constants/api"
import { ROUTE_RESET_PASSWORD } from "@/constants/routes"
import { authClient } from "@/lib/auth-client"
import { logger } from "@/lib/logger"

export function ForgotPasswordForm(): ReactNode {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [formState, setFormState] = useState<ApiResponse>(INITIAL_FORM_STATE)
  const { t } = useLingui()

  const handleForgotPassword = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()

    const formData: FormData = new FormData(event.currentTarget)
    const payload: ForgotPasswordPayload = {
      email: formData.get("email") as string,
    }

    const errors: ValueError[] = Array.from(Value.Errors(forgotPasswordSchema, payload))
    const errorMessages: ForgotPasswordErrorMessages = {}

    for (const error of errors) {
      switch (error.path.replace("/", "")) {
        case "email":
          errorMessages.email = t({ message: "The email is invalid." })
          break
        default:
          logger.warn(`Forgot Password Validation: Unknown error at ${error.path}`)
          break
      }
    }

    if (Object.keys(errorMessages).length > 0) {
      setFormState({
        success: false,
        message: t({ message: "Validation errors occurred." }),
        error: errorMessages,
      })
    } else {
      await authClient.forgetPassword(
        {
          email: payload.email,
          redirectTo: `${process.env.BASE_URL}${ROUTE_RESET_PASSWORD.PATH}`,
        },
        {
          onRequest: () => {
            setIsLoading(true)
            setFormState(INITIAL_FORM_STATE)
          },
          onResponse: () => {
            setIsLoading(false)
          },
          onError: (ctx: ErrorContext) => {
            setFormState({
              success: false,
              message: ctx.error.message,
            })
          },
          onSuccess: () => {
            setFormState({
              success: true,
              message: t({ message: "A reset password link has been sent in your inbox!" }),
            })
          },
        },
      )
    }
  }

  return (
    <form className="w-full" noValidate onSubmit={handleForgotPassword}>
      {formState?.message && (
        <AlertMessage type={formState.success ? "success" : "error"}>{formState.message}</AlertMessage>
      )}
      <Input
        id="email"
        label={t({ message: "Email" })}
        required
        dataTestId="forgot-password_input-email_email"
        errorMessage={formState?.error?.email}
      />
      <Button type="submit" className="w-full" disabled={isLoading}>
        <Trans>Send Email</Trans>
      </Button>
    </form>
  )
}
