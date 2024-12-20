import { ReactNode } from "react"

export default function ChangeEmailFormSkeleton(): ReactNode {
  return (
    <div className="w-full space-y-6 animate-pulse">
      <div className="h-6 rounded bg-gray-200 w-64"></div>
      <div className="space-y-2">
        <div className="h-6 rounded bg-gray-200 w-48"></div>
        <div className="h-8 rounded bg-gray-200"></div>
      </div>
      <div className="h-10 rounded bg-gray-200"></div>
    </div>
  )
}
