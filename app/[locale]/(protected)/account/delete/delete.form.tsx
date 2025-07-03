"use client"

import { ClipboardEvent, FormEvent, ReactNode, useState } from "react"
import { Trans, useLingui } from "@lingui/react/macro"
import { Value, ValueError } from "@sinclair/typebox/value"
import clsx from "clsx/lite"
import {
  DeleteAccountFormValidationErrors,
  DeleteAccountPayload,
  deleteAccountSchema,
} from "@/app/[locale]/(protected)/account/delete/delete.schema"
import AlertMessage from "@/components/ui/AlertMessage"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { INITIAL_FORM_STATE } from "@/constants/api"
import { ROUTE_HOME } from "@/constants/routes"
import { authClient } from "@/lib/auth-client"
import { logger } from "@/lib/logger"

export function DeleteAccountForm(): ReactNode {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [formState, setFormState] = useState<ApiResponse>(INITIAL_FORM_STATE)
  const { t } = useLingui()

  const handleDeleteUser = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()

    const formData: FormData = new FormData(event.currentTarget)
    const payload: DeleteAccountPayload = {
      email: formData.get("email") as string,
    }

    const errors: ValueError[] = Array.from(Value.Errors(deleteAccountSchema, payload))
    const errorMessages: DeleteAccountFormValidationErrors = {}

    for (const error of errors) {
      switch (error.path.replace("/", "")) {
        case "email":
          errorMessages.email = t({ message: "The email is invalid." })
          break
        default:
          logger.warn(`Delete User Validation: Unknown error at ${error.path}`)
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
      await authClient.deleteUser(
        {
          callbackURL: ROUTE_HOME.PATH,
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
              message: t({
                message:
                  "Your account deletion request has been accepted. To complete the process, please confirm by clicking the link sent to your email.",
              }),
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
    <form
      className={clsx(
        "w-full p-4 border border-red-200 rounded-lg bg-red-50",
        "dark:border-dark-card-border dark:bg-dark-card-background",
      )}
      noValidate
      onSubmit={handleDeleteUser}
    >
      {formState?.message && (
        <AlertMessage type={formState.success ? "success" : "error"}>{formState.message}</AlertMessage>
      )}
      <p className={clsx("text-red-600 font-medium", "dark:text-red-400")}>
        <Trans>
          Please note that deleting your account is a permanent action and cannot be undone. All your data, including
          your profile, settings, and any associated information, will be deleted immediately once you confirm your
          request through the link sent to your email. If you did not request account deletion, please contact our
          support team right away for assistance.
        </Trans>
      </p>
      <br />
      <Input
        type="email"
        id="email"
        label={t({ message: "Enter your email to request an account deletion" })}
        autoComplete="off"
        required
        dataTestId="delete-account_input-email_email"
        placeholder={t({ message: "Enter your email" })}
        errorMessage={formState?.error?.email}
        onPaste={(event: ClipboardEvent<HTMLInputElement>) => event.preventDefault()}
      />

      <Button
        type="submit"
        className="mt-4 border-t-red-200 border-e-red-400 border-b-red-400 border-s-red-200 bg-red-500 text-white"
        disabled={isLoading}
      >
        <Trans>Confirm Deletion</Trans>
      </Button>
    </form>
  )
}
