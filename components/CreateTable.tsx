"use client"

import { ReactNode, useState } from "react"
import { TableType } from "@prisma/client"
import Checkbox from "@/components/ui/Checkbox"
import Modal from "@/components/ui/Modal"
import Select from "@/components/ui/Select"

type CreateTableProps = {
  isOpen: boolean
  onClose: () => void
  onSubmitSuccess: (tableId: string) => void
}

export default function CreateTable({ isOpen, onClose, onSubmitSuccess }: CreateTableProps): ReactNode {
  const [tableType, setTableType] = useState<TableType>(TableType.PUBLIC)
  const [ratedGame, setRatedGame] = useState<boolean>(true)

  const handleCreateTable = (): void => {
    // TODO: Call api here then pass table id to room to refresh tables
    console.log("handleCreateTable", tableType, ratedGame)
    onSubmitSuccess("test-2")
  }

  return (
    <Modal title="Create Table" isOpen={isOpen} onClose={onClose} confirmText="Create" onConfirm={handleCreateTable}>
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

        <Checkbox id="ratedGame" label="Rated Game" defaultChecked={ratedGame} onChange={setRatedGame} />
      </div>
    </Modal>
  )
}
