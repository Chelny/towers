import { ReactNode } from "react"

export default function PasskeysFormSkeleton(): ReactNode {
  return (
    <div className="w-full space-y-6 animate-pulse">
      <div className="w-52 h-6 rounded bg-gray-200"></div>
      {Array.from({ length: 3 }).map((_, index: number) => (
        <div key={index} className="flex items-center justify-between gap-2">
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-6 rounded bg-gray-200"></div>
            <div className="h-4 rounded bg-gray-200"></div>
          </div>
          <div className="flex-1 flex items-center justify-end gap-2">
            <div className="w-8 h-8 rounded bg-gray-200"></div>
            <div className="w-8 h-8 rounded bg-gray-200"></div>
          </div>
        </div>
      ))}
      <div className="h-10 rounded bg-gray-200"></div>
    </div>
  )
}
