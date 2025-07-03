"use client"

import { ReactNode } from "react"
import { useLingui } from "@lingui/react/macro"
import Modal from "@/components/ui/Modal"

export type AlertModalProps = {
  title: string
  message: string
  testId: string
  onCancel: () => void
}

export default function AlertModal({ title, message, testId, onCancel }: AlertModalProps): ReactNode {
  const { t } = useLingui()

  return (
    <Modal title={title} cancelText={t({ message: "Close" })} dataTestId={`alert_${testId}`} onCancel={onCancel}>
      {message}
    </Modal>
  )
}
