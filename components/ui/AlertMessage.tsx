import { ReactNode } from "react"
import clsx from "clsx/lite"

type AlertMessageProps = {
  type?: "info" | "warning" | "success" | "error"
  children: ReactNode
}

export default function AlertMessage({ type = "info", children }: AlertMessageProps): ReactNode {
  return (
    <div
      className={clsx(
        "p-2 mb-2 border border-solid font-medium",
        type === "info" && "border-sky-200 bg-sky-100 text-sky-600",
        type === "warning" && "border-amber-200 bg-amber-100 text-amber-600",
        type === "success" && "border-emerald-200 bg-emerald-100 text-emerald-600",
        type === "error" && "border-red-200 bg-red-100 text-red-600"
      )}
    >
      {children}
    </div>
  )
}
