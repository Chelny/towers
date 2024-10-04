"use client"

import { ChangeEvent, ReactNode, useState } from "react"
import { TableType } from "@prisma/client"
import Checkbox from "@/components/ui/Checkbox"
import Modal from "@/components/ui/Modal"
import Select from "@/components/ui/Select"

type CreateTableProps = {
  isOpen: boolean
  onSubmitSuccess: (tableId: string) => void
  onCancel: () => void
}

export default function CreateTable({ isOpen, onSubmitSuccess, onCancel }: CreateTableProps): ReactNode {
  const [tableType, setTableType] = useState<TableType>(TableType.PUBLIC)
  const [ratedGame, setRatedGame] = useState<boolean>(true)

  const handleCreateTable = (): void => {
    // TODO: Call api here then pass table id to room to refresh tables
    onSubmitSuccess("test-2")
  }

  return (
    <Modal
      title="Create Table"
      isOpen={isOpen}
      confirmText="Create"
      dataTestId="create-table-modal"
      onConfirm={handleCreateTable}
      onCancel={onCancel}
    >
      <div className="h-full mb-2">
        <Select
          id="tableType"
          label="Table Type"
          defaultValue={tableType}
          required
          onChange={(value: string) => setTableType(value as TableType)}
        >
          <Select.Option value={TableType.PUBLIC}>Public</Select.Option>
          <Select.Option value={TableType.PROTECTED}>Protected</Select.Option>
          <Select.Option value={TableType.PRIVATE}>Private</Select.Option>
        </Select>

        <Checkbox
          id="ratedGame"
          label="Rated Game"
          defaultChecked={ratedGame}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setRatedGame(event.target.checked)}
        />
      </div>
    </Modal>
  )
}
