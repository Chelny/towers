"use client"

import { FormEvent, ReactNode, useState } from "react"
import { Trans, useLingui } from "@lingui/react/macro"
import { ValueError } from "@sinclair/typebox/errors"
import { Value } from "@sinclair/typebox/value"
import { Passkey } from "better-auth/plugins/passkey"
import clsx from "clsx/lite"
import { LuPencilLine } from "react-icons/lu"
import { LuTrash2 } from "react-icons/lu"
import {
  AddPasskeyFormValidationErrors,
  AddPasskeyPayload,
  addPasskeySchema,
} from "@/app/[locale]/(protected)/account/profile/passkey.schema"
import AlertMessage from "@/components/ui/AlertMessage"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { INITIAL_FORM_STATE } from "@/constants/api"
import { authClient } from "@/lib/auth-client"
import { logger } from "@/lib/logger"

export function PasskeysForm(): ReactNode {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [formState, setFormState] = useState<ApiResponse>(INITIAL_FORM_STATE)
  const { data: passkeys, isPending, isRefetching } = authClient.useListPasskeys()
  const { t } = useLingui()

  const handleAddPasskey = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()

    const formData: FormData = new FormData(event.currentTarget)
    const payload: AddPasskeyPayload = {
      name: formData.get("passkeyName") as string,
    }

    const errors: ValueError[] = Array.from(Value.Errors(addPasskeySchema, payload))
    const errorMessages: AddPasskeyFormValidationErrors = {}

    for (const error of errors) {
      switch (error.path.replace("/", "")) {
        case "name":
          errorMessages.name = t({ message: "The name is invalid." })
          break
        default:
          logger.warn(`Add Passkey Validation: Unknown error at ${error.path}`)
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
      await authClient.passkey.addPasskey(
        {
          name: payload.name,
        },
        {
          onRequest: () => {
            setIsLoading(true)
            setFormState(INITIAL_FORM_STATE)
          },
          onSuccess: () => {
            const name: string = payload.name
            setIsLoading(false)
            setFormState({
              success: true,
              message: t({ message: `The passkey "${name}" has been added!` }),
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

  const handleUpdate = async (passkey: Passkey): Promise<void> => {
    await authClient.passkey.updatePasskey(
      {
        id: passkey.id,
        name: passkey.name ?? "",
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
            message: t({ message: "The passkey has been updated!" }),
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

  const handleDelete = async (passkey: Passkey): Promise<void> => {
    await authClient.passkey.deletePasskey(
      {
        id: passkey.id,
      },
      {
        onRequest: () => {
          setIsLoading(true)
          setFormState(INITIAL_FORM_STATE)
        },
        onSuccess: () => {
          const name: string | undefined = passkey.name
          setIsLoading(false)
          setFormState({
            success: true,
            message: t({ message: `The passkey "${name}" has been deleted!` }),
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

  return (
    <>
      <h2 className="text-lg font-semibold mb-4">
        <Trans>Passkeys</Trans>
      </h2>
      <form className="w-full" noValidate onSubmit={handleAddPasskey}>
        {formState?.message && (
          <AlertMessage type={formState.success ? "success" : "error"}>{formState.message}</AlertMessage>
        )}
        <Input
          id="passkeyName"
          label={t({ message: "Name" })}
          placeholder={t({ message: "Enter a name for the passkey" })}
          required
          dataTestId="passkeys_input-text_name"
          errorMessage={formState?.error?.name}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          <Trans>Add Passkey</Trans>
        </Button>
      </form>
      {passkeys && passkeys?.length > 0 && <hr className="mt-6 mb-4" />}
      <ul className="space-y-2">
        {passkeys?.map((passkey: Passkey) => {
          const passkeyName: string = passkey.name!
          return (
            <li
              key={passkey.id}
              className={clsx(
                "flex justify-between items-center p-2 border rounded bg-white",
                "dark:bg-dark-background",
              )}
            >
              <div className="flex-1">{passkey.name}</div>
              <div className="flex-1 flex gap-3 justify-end items-center">
                <Button
                  type="button"
                  disabled={isLoading || isPending || isRefetching}
                  aria-label={t({ message: `Edit "${passkeyName}" passkey` })}
                  onClick={() => handleUpdate(passkey)}
                >
                  <LuPencilLine className="w-5 h-5" />
                </Button>
                <Button
                  type="button"
                  disabled={isLoading || isPending || isRefetching}
                  aria-label={t({ message: `Delete "${passkeyName}" passkey` })}
                  onClick={() => handleDelete(passkey)}
                >
                  <LuTrash2 className="w-5 h-5" />
                </Button>
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}
