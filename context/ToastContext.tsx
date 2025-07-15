"use client"

import { createContext, ReactNode, useCallback, useContext, useState } from "react"
import { createId } from "@paralleldrive/cuid2"
import { ToastContainer } from "@/components/ui/ToastContainer"

export type ToastPosition = "top-start" | "top-end" | "bottom-start" | "bottom-end"

export type Toast = {
  id: string
  message: string
  duration?: number
  position?: ToastPosition
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, "id">) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id: string = createId()

    const newToast: Toast = { ...toast, id }
    setToasts((prev: Toast[]) => [...prev, newToast])

    const duration: number = toast.duration ?? 3500

    setTimeout(() => {
      setToasts((prev: Toast[]) => prev.filter((toast: Toast) => toast.id !== id))
    }, duration)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  )
}

export const useToast = (): ToastContextType => {
  const context: ToastContextType | undefined = useContext(ToastContext)
  if (!context) throw new Error("useToast must be used within a ToastProvider")
  return context
}
