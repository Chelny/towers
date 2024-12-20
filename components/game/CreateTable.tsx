"use client"

import { FormEvent, ReactNode, useState } from "react"
import { ITowersTableWithRelations, TableType } from "@prisma/client"
import { Type } from "@sinclair/typebox"
import { Value, ValueError } from "@sinclair/typebox/value"
import Checkbox from "@/components/ui/Checkbox"
import Modal from "@/components/ui/Modal"
import Select from "@/components/ui/Select"
import { authClient } from "@/lib/auth-client"
import { useAppDispatch } from "@/lib/hooks"
import { roomErrorMessage } from "@/redux/features/socket-slice"
import { AppDispatch } from "@/redux/store"

type CreateTableProps = {
  isOpen: boolean
  roomId: string
  onSubmitSuccess: (table: ITowersTableWithRelations) => void
  onCancel: () => void
}

export default function CreateTable({ isOpen, roomId, onSubmitSuccess, onCancel }: CreateTableProps): ReactNode {
  const { data: session, isPending, error } = authClient.useSession()
  const dispatch: AppDispatch = useAppDispatch()
  const [errorMessages, setErrorMessages] = useState<CreateTableFormValidationErrors>({})
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const handleFormValidation = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    const formElement: EventTarget & HTMLFormElement = event.currentTarget
    const formData: FormData = new FormData(formElement)
    const payload: CreateTablePayload = {
      tableType: formData.get("tableType") as TableType,
      rated: formData.get("rated") === "on",
    }
    const errors: ValueError[] = Array.from(Value.Errors(createTableSchema, payload))

    for (const error of errors) {
      switch (error.path.replace("/", "")) {
        case "tableType":
          setErrorMessages((prev: CreateTableFormValidationErrors) => ({
            ...prev,
            tableType: "You must select a table type.",
          }))
          break
        case "rated":
          setErrorMessages((prev: CreateTableFormValidationErrors) => ({
            ...prev,
            rated: "You must rate this game.",
          }))
          break
        default:
          console.error(`Create Table Action: Unknown error at ${error.path}`)
          break
      }
    }

    if (Object.keys(errorMessages).length === 0) {
      await handleCreateTable(payload)
    }
  }

  const handleCreateTable = async (body: CreateTablePayload): Promise<void> => {
    setIsSubmitting(true)

    try {
      const response: Response = await fetch("/api/tables", {
        method: "POST",
        body: JSON.stringify({
          ...body,
          roomId,
          userId: session?.user.id,
        }),
      })

      if (!response.ok) {
        const errorData: ApiResponse = await response.json()
        throw new Error(errorData?.message)
      }

      const result = await response.json()
      onSubmitSuccess(result.data)
      onCancel?.()
    } catch (error) {
      dispatch(roomErrorMessage({ roomId, message: error as string }))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      title="Create Table"
      confirmText="Create"
      isConfirmButtonDisabled={isSubmitting}
      dataTestId="create-table-modal"
      onConfirm={handleFormValidation}
      onCancel={onCancel}
    >
      <Select
        id="tableType"
        label="Table Type"
        defaultValue={TableType.PUBLIC}
        required
        errorMessage={errorMessages.tableType}
      >
        <Select.Option value={TableType.PUBLIC}>Public</Select.Option>
        <Select.Option value={TableType.PROTECTED}>Protected</Select.Option>
        <Select.Option value={TableType.PRIVATE}>Private</Select.Option>
      </Select>

      <Checkbox id="rated" label="Rated Game" defaultChecked={true} errorMessage={errorMessages.rated} />
    </Modal>
  )
}

export const createTableSchema = Type.Object({
  tableType: Type.Union([
    Type.Literal(TableType.PUBLIC),
    Type.Literal(TableType.PROTECTED),
    Type.Literal(TableType.PRIVATE),
  ]),
  rated: Type.Boolean(),
})

export type CreateTablePayload = FormPayload<typeof createTableSchema>
export type CreateTableFormValidationErrors = FormValidationErrors<keyof CreateTablePayload>
