"use client"

import { ReactNode, useEffect, useRef } from "react"
import Button from "@/components/ui/Button"

type ModalProps = {
  children: ReactNode
  title: string
  isOpen: boolean
  closeText?: string
  confirmText?: string
  onClose?: () => void
  onConfirm?: () => void
}

export default function Modal({
  children,
  title,
  isOpen,
  closeText = "Close",
  confirmText = "Confirm",
  onClose,
  onConfirm
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal()
    } else {
      dialogRef.current?.close()
    }
  }, [isOpen])

  const handleConfirm = (): void => {
    onConfirm?.()
    handleClose()
  }

  const handleClose = (): void => {
    onClose?.()
    dialogRef.current?.close()
  }

  return (
    <dialog
      ref={dialogRef}
      className="fixed top-1/2 left-1/2 z-40 w-full max-w-md rounded shadow-lg -translate-x-1/2 -translate-y-1/2"
      onCancel={handleClose}
    >
      <div className="flex justify-between items-center p-4 border-b border-gray-300">
        <h3 className="text-2xl font-light">{title}</h3>
        <button
          className="self-start p-2 text-gray-400 hover:text-gray-500"
          aria-label="Close modal"
          onClick={handleClose}
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
          <Button type="button" className="w-full" onClick={handleConfirm}>
            {confirmText}
          </Button>
        )}
        <Button type="button" className="w-full !ring-0" onClick={handleClose}>
          {closeText}
        </Button>
      </div>
    </dialog>
  )
}
