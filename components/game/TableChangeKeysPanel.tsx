"use client"

import { ReactNode, useEffect, useState } from "react"
import { useLingui } from "@lingui/react/macro"
import clsx from "clsx/lite"
import AlertMessage from "@/components/ui/AlertMessage"
import Button from "@/components/ui/Button"
import { fKeyMessages } from "@/constants/f-key-messages"
import { SocketEvents } from "@/constants/socket-events"
import { useSocket } from "@/context/SocketContext"
import { TablePanelView } from "@/enums/table-panel-view"
import { TowersControlKeys } from "@/enums/towers-control-keys"
import { getReadableKeyLabel } from "@/lib/keyboard/get-readable-key-label"
import { keyboardKeyLabels } from "@/lib/keyboard/keyboard-key-labels"

interface TableChangeKeysPanelProps {
  controlKeys: TowersControlKeys
  onChangeView: (view: TablePanelView) => void
}

export default function TableChangeKeysPanel({
  controlKeys: initialControlKeys,
  onChangeView,
}: TableChangeKeysPanelProps): ReactNode {
  const { i18n, t } = useLingui()
  const { socket, isConnected } = useSocket()
  const [controlKeys, setControlKeys] = useState<TowersControlKeys>({ ...initialControlKeys })
  const [selectedKey, setSelectedKey] = useState<keyof TowersControlKeys | null>(null)
  const [showErrorMessage, setShowErrorMessage] = useState<boolean>(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false)
  const validKeys: string[] = Object.keys(keyboardKeyLabels)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (!selectedKey) return
      if (!validKeys.includes(e.code)) return

      setControlKeys((prev: TowersControlKeys) => ({ ...prev, [selectedKey]: e.code }))
      setSelectedKey(null)
      setShowErrorMessage(false)
      setShowSuccessMessage(false)
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedKey, validKeys])

  const keyUsageMap = Object.entries(controlKeys).reduce(
    (map: Record<string, number>, [_, key]: [string, string]) => {
      map[key] = (map[key] || 0) + 1
      return map
    },
    {} as Record<string, number>,
  )

  const duplicatedKeys = new Set(
    Object.entries(keyUsageMap)
      .filter(([_, count]: [string, number]) => count > 1)
      .map(([key]: [string, number]) => key),
  )

  const handleSave = (): void => {
    if (duplicatedKeys.size > 0) {
      setShowErrorMessage(true)
      setShowSuccessMessage(false)
    } else {
      setShowErrorMessage(false)
      setShowSuccessMessage(true)
      socket?.emit(SocketEvents.GAME_SAVE_CONTROL_KEYS, { controlKeys })
    }
  }

  const renderRow = (label: string, key: keyof TowersControlKeys, isEditable: boolean = false): ReactNode => {
    const isDuplicate: boolean = duplicatedKeys.has(controlKeys[key])
    return (
      <div
        key={key}
        className={`flex gap-4 p-2 cursor-${isEditable ? "pointer" : "default"}
          ${selectedKey === key ? "bg-yellow-200 dark:bg-yellow-300 dark:text-black" : ""}
          ${isDuplicate ? "bg-red-200" : "bg-gray-200 dark:bg-slate-700"}`}
        onClick={() => (isEditable ? setSelectedKey(key) : null)}
      >
        <div className="w-7/12">{label}</div>
        <div className="w-5/12">{getReadableKeyLabel(i18n, controlKeys[key])}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="w-full max-w-3xl">
        {showErrorMessage && (
          <AlertMessage type="error">
            {t({ message: "Duplicate keys detected. Each key must be unique." })}
          </AlertMessage>
        )}

        {showSuccessMessage && (
          <AlertMessage type="success">
            {t({ message: "Your key bindings have been saved successfully!" })}
          </AlertMessage>
        )}
      </div>

      <div className="flex items-evenly gap-6 w-full max-w-5xl pt-2">
        <div className="flex-1 space-y-1">
          {renderRow("Move Piece Left", "MOVE_LEFT", true)}
          {renderRow("Move Piece Right", "MOVE_RIGHT", true)}
          {renderRow("Cycle Piece Colors", "CYCLE", true)}
          {renderRow("Drop Piece Quickly", "DROP", true)}
          {renderRow("Automatically Use Item", "USE_ITEM", true)}

          {Array.from({ length: 8 }).map((_, index: number) => {
            const keyName: keyof TowersControlKeys = `USE_ITEM_ON_PLAYER_${index + 1}` as keyof TowersControlKeys
            return renderRow(i18n._("Use Item on Player {number}", { number: index + 1 }), keyName, true)
          })}
        </div>

        <div className="flex-1 space-y-1">
          {Array.from({ length: 12 }).map((_, index: number) => {
            const fKey: keyof typeof fKeyMessages = `F${index + 1}` as keyof typeof fKeyMessages
            return (
              <div key={index} className={clsx("flex gap-4 p-2 bg-gray-200", "dark:bg-slate-700")}>
                <div className="w-1/12">{`F${index + 1}`}</div>
                <div className="w-11/12">{i18n._(fKeyMessages[fKey])}</div>
              </div>
            )
          })}

          <div className="flex flex-col">
            <div className="flex items-evenly gap-2 py-0.5">
              <Button type="button" className="w-full" disabled={!isConnected} onClick={handleSave}>
                {t({ message: "Save" })}
              </Button>
              <Button
                type="button"
                className="w-full"
                onClick={() => {
                  setShowSuccessMessage(false)
                  setShowErrorMessage(false)
                  onChangeView(TablePanelView.GAME)
                }}
              >
                {t({ message: "Cancel" })}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
