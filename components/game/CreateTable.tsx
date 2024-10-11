"use client"

import { FormEvent, ReactNode, useState } from "react"
import { ITowersTable, TableType } from "@prisma/client"
import { Type } from "@sinclair/typebox"
import { Value, ValueError } from "@sinclair/typebox/value"
import axios, { AxiosResponse } from "axios"
import Checkbox from "@/components/ui/Checkbox"
import Modal from "@/components/ui/Modal"
import Select from "@/components/ui/Select"
import { useSessionData } from "@/hooks/useSessionData"

export const createTableSchema = Type.Object({
  tableType: Type.Union([
    Type.Literal(TableType.PUBLIC),
    Type.Literal(TableType.PROTECTED),
    Type.Literal(TableType.PRIVATE)
  ]),
  rated: Type.Boolean()
})

export type CreateTableFormData = SchemaFormData<typeof createTableSchema>
export type CreateTableFormErrorMessages = SchemaFormErrorMessages<keyof CreateTableFormData>

type CreateTableProps = {
  isOpen: boolean
  roomId: string
  onSubmitSuccess: (table: ITowersTable) => void
  onCancel: () => void
}

export default function CreateTable({ isOpen, roomId, onSubmitSuccess, onCancel }: CreateTableProps): ReactNode {
  const { data: session } = useSessionData()
  const [errorMessages, setErrorMessages] = useState<CreateTableFormErrorMessages>({})
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const handleFormValidation = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    const formElement: EventTarget & HTMLFormElement = event.currentTarget
    const formData: FormData = new FormData(formElement)
    const rawFormData: CreateTableFormData = {
      tableType: formData.get("tableType") as TableType,
      rated: formData.get("rated") === "on"
    }
    const errors: ValueError[] = Array.from(Value.Errors(createTableSchema, rawFormData))

    for (const error of errors) {
      switch (error.path.replace("/", "")) {
        case "tableType":
          setErrorMessages((prev: CreateTableFormErrorMessages) => ({
            ...prev,
            tableType: "You must select a table type."
          }))
          break
        case "rated":
          setErrorMessages((prev: CreateTableFormErrorMessages) => ({
            ...prev,
            rated: "You must rate this game."
          }))
          break
        default:
          console.error(`Create Table Action: Unknown error at ${error.path}`)
          break
      }
    }

    if (Object.keys(errorMessages).length === 0) {
      await handleCreateTable(rawFormData)
    }
  }

  const handleCreateTable = async (body: CreateTableFormData): Promise<void> => {
    setIsSubmitting(true)

    try {
      const response: AxiosResponse = await axios.post("/api/tables", {
        ...body,
        roomId,
        hostId: session?.user.id
      })

      if (response.status === 201) {
        onSubmitSuccess(response.data.data)
      }
    } catch (error) {
      console.error("Error creating table:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      title="Create Table"
      isOpen={isOpen}
      confirmText="Create"
      isConfirmButtonDisabled={isSubmitting}
      dataTestId="create-table-modal"
      onConfirm={handleFormValidation}
      onCancel={onCancel}
    >
      <div className="h-full mb-2">
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
      </div>
    </Modal>
  )
}
