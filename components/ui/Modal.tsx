"use client"

import { FormEvent, PropsWithChildren, ReactNode, RefObject, useEffect, useRef } from "react"
import { useLingui } from "@lingui/react/macro"
import clsx from "clsx/lite"
import Button from "@/components/ui/Button"

type ModalProps = PropsWithChildren<{
  title: string
  confirmText?: string
  cancelText?: string
  isConfirmButtonDisabled?: boolean
  dataTestId?: string
  onConfirm?: (event: FormEvent<HTMLFormElement>) => void
  onCancel?: () => void
}>

export default function Modal({
  children,
  title,
  cancelText,
  confirmText,
  isConfirmButtonDisabled = false,
  dataTestId = undefined,
  onConfirm,
  onCancel,
}: ModalProps): ReactNode {
  const dialogRef: RefObject<HTMLDialogElement | null> = useRef<HTMLDialogElement | null>(null)
  const { t } = useLingui()

  useEffect(() => {
    const dialog: HTMLDialogElement | null = dialogRef.current
    if (!dialog) return

    dialog.showModal()
    dialog.focus()

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.code === "Escape") {
        event.preventDefault()
        handleCancel()
      }
    }

    dialog.addEventListener("keydown", handleKeyDown)

    return () => {
      dialog.removeEventListener("keydown", handleKeyDown)
      dialog.close()
    }
  }, [])

  const handleConfirm = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    onConfirm?.(event)
  }

  const handleCancel = (): void => {
    onCancel?.()
    dialogRef.current?.close()
  }

  return (
    <dialog
      ref={dialogRef}
      className={clsx(
        "fixed top-1/2 start-1/2 z-40 w-full max-w-md rounded shadow-lg -translate-x-1/2 -translate-y-1/2",
        "rtl:translate-x-1/2",
        "dark:bg-dark-modal-background",
      )}
      data-testid={`dialog_${dataTestId}`}
      onCancel={handleCancel}
    >
      <form noValidate onSubmit={handleConfirm}>
        <div
          className={clsx(
            "flex justify-between items-center px-4 py-3 border-b border-gray-300",
            "dark:border-dark-modal-border",
          )}
        >
          <h3 className={clsx("text-2xl", "dark:text-dark-modal-heading-text")}>{title}</h3>
          <button
            className="self-start p-2 text-gray-400 hover:text-gray-500"
            aria-label={t({ message: "Close" })}
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

        <div className={clsx("p-4", "dark:text-dark-modal-body-text")}>{children}</div>

        <div
          className={clsx(
            "flex justify-end gap-2 p-4 border-t border-gray-300",
            "dark:border-t-dark-modal-border dark:border-dark-modal-border",
          )}
        >
          {onConfirm && (
            <Button type="submit" className="w-full" disabled={isConfirmButtonDisabled}>
              {confirmText ?? t({ message: "Confirm" })}
            </Button>
          )}
          <Button type="button" className="w-full !ring-0" onClick={handleCancel}>
            {cancelText ?? t({ message: "Cancel" })}
          </Button>
        </div>
      </form>
    </dialog>
  )
}
