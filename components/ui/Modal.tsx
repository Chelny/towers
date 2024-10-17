"use client"

import { FormEvent, ReactNode, useEffect, useRef } from "react"
import Button from "@/components/ui/Button"

type ModalProps = {
  children: ReactNode
  title: string
  isOpen: boolean
  confirmText?: string
  cancelText?: string
  isConfirmButtonDisabled?: boolean
  dataTestId?: string
  onConfirm?: (event: FormEvent<HTMLFormElement>) => void
  onCancel?: () => void
}

export default function Modal({
  children,
  title,
  isOpen,
  cancelText = "Cancel",
  confirmText = "Confirm",
  isConfirmButtonDisabled = false,
  dataTestId = undefined,
  onCancel,
  onConfirm
}: ModalProps): ReactNode {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal()

      if (dialogRef.current) {
        dialogRef.current.focus()
      }
    } else {
      dialogRef.current?.close()
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        handleCancel()
      }
    }

    dialogRef.current?.addEventListener("keydown", handleKeyDown)
    return () => dialogRef.current?.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

  const handleConfirm = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    onConfirm?.(event)
  }

  const handleCancel = (): void => {
    onCancel?.()
    dialogRef.current?.close()
  }

  if (!isOpen) return null

  return (
    <dialog
      ref={dialogRef}
      className="fixed top-1/2 left-1/2 z-40 w-full max-w-md rounded shadow-lg -translate-x-1/2 -translate-y-1/2"
      data-testid={dataTestId}
      onCancel={handleCancel}
    >
      <form noValidate onSubmit={(event: FormEvent<HTMLFormElement>) => handleConfirm(event)}>
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-300">
          <h3 className="text-2xl">{title}</h3>
          <button
            className="self-start p-2 text-gray-400 hover:text-gray-500"
            aria-label="Close modal"
            onClick={handleCancel}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">{children}</div>
        <div className="flex justify-end gap-2 p-4 border-t border-gray-300">
          {onConfirm && (
            <Button type="submit" className="w-full" disabled={isConfirmButtonDisabled}>
              {confirmText}
            </Button>
          )}
          <Button type="button" className="w-full !ring-0" onClick={handleCancel}>
            {cancelText}
          </Button>
        </div>
      </form>
    </dialog>
  )
}
