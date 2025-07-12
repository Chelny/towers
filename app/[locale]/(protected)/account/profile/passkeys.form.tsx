"use client"

import { FormEvent, InputEvent, ReactNode, useRef, useState } from "react"
import { ErrorContext } from "@better-fetch/fetch"
import { Trans, useLingui } from "@lingui/react/macro"
import { ValueError } from "@sinclair/typebox/errors"
import { Value } from "@sinclair/typebox/value"
import { Passkey } from "better-auth/plugins/passkey"
import clsx from "clsx/lite"
import { LuPencilLine, LuSave } from "react-icons/lu"
import { LuTrash2 } from "react-icons/lu"
import {
  AddPasskeyFormValidationErrors,
  AddPasskeyPayload,
  addPasskeySchema,
} from "@/app/[locale]/(protected)/account/profile/passkey.schema"
import AlertMessage from "@/components/ui/AlertMessage"
import Button from "@/components/ui/Button"
import Input, { InputImperativeHandle } from "@/components/ui/Input"
import { INITIAL_FORM_STATE } from "@/constants/api"
import { authClient } from "@/lib/auth-client"
import { logger } from "@/lib/logger"

export function PasskeysForm(): ReactNode {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [formState, setFormState] = useState<ApiResponse>(INITIAL_FORM_STATE)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState<string>("")
  const newPasskeyInputRef = useRef<InputImperativeHandle>(null)
  const editPasskeyInputRef = useRef<InputImperativeHandle>(null)
  const { data: passkeys, isPending, refetch, isRefetching } = authClient.useListPasskeys()
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
            const name: string = payload.name
            setFormState({
              success: true,
              message: t({ message: `The passkey "${name}" has been added!` }),
            })
            if (newPasskeyInputRef.current) {
              newPasskeyInputRef.current.clear()
            }
            refetch()
          },
        },
      )
    }
  }

  const handleUpdate = async (passkey: Passkey): Promise<void> => {
    await authClient.passkey.updatePasskey(
      {
        id: passkey.id,
        name: editingValue,
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
            message: t({ message: "The passkey has been updated!" }),
          })
          setEditingId(null)
          setEditingValue("")
          refetch()
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
          const name: string | undefined = passkey.name
          setFormState({
            success: true,
            message: t({ message: `The passkey "${name}" has been deleted!` }),
          })
          refetch()
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
          ref={newPasskeyInputRef}
          id="passkeyName"
          label={t({ message: "Name" })}
          placeholder={t({ message: "Enter a name for the passkey" })}
          required
          dataTestId="passkeys_input-text_name"
          errorMessage={formState?.error?.name}
        />
        {/* FIXME: Passkey can't sign in */}
        <Button type="submit" className="w-full" disabled={isLoading || true}>
          <Trans>Add Passkey</Trans>
        </Button>
      </form>
      {passkeys && passkeys?.length > 0 && (
        <hr className={clsx("mt-6 mb-4 border border-neutral-200", "dark:border-slate-600")} />
      )}
      <ul className="flex flex-col gap-2">
        {passkeys?.map((passkey: Passkey) => {
          const isEditing: boolean = editingId === passkey.id
          const passkeyName: string = passkey.name!

          return (
            <li
              key={passkey.id}
              className={clsx(
                "flex justify-between items-center gap-2 p-2 border border-gray-200 rounded-sm bg-white",
                "dark:border-dark-card-border dark:bg-dark-background",
              )}
            >
              <Input
                ref={isEditing ? editPasskeyInputRef : null}
                id={`passkey-${passkey.id}`}
                className="flex-1 -mb-4"
                readOnly={!isEditing}
                defaultValue={isEditing ? editingValue : passkeyName}
                onInput={(event: InputEvent<HTMLInputElement>) => {
                  setEditingValue((event.target as HTMLInputElement).value)
                }}
              ></Input>
              <div className="flex-1 flex gap-2 justify-end items-center">
                {isEditing ? (
                  <Button
                    type="button"
                    disabled={isLoading || isPending || isRefetching}
                    aria-label={t({ message: "Save passkey" })}
                    onClick={() => handleUpdate(passkey)}
                  >
                    <LuSave className="w-5 h-5" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    disabled={isLoading || isPending || isRefetching}
                    aria-label={t({ message: `Edit "${passkeyName}" passkey` })}
                    onClick={() => {
                      setEditingId(passkey.id)
                      setEditingValue(passkey.name ?? "")
                      setTimeout(() => {
                        editPasskeyInputRef.current?.focus()
                      }, 0)
                    }}
                  >
                    <LuPencilLine className="w-5 h-5" />
                  </Button>
                )}
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
