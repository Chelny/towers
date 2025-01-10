import { ReactNode } from "react"

export default function ChatSkeleton(): ReactNode {
  return (
    <div className="overflow-hidden flex flex-col gap-1 h-full animate-pulse">
      <div className="w-full h-10 rounded bg-gray-200"></div>
      <div className="overflow-y-auto flex-1 my-1">
        {Array.from({ length: 10 }).map((_, index: number) => (
          <div key={index} className="flex items-center gap-1 py-2">
            <div className="w-36 h-4 rounded bg-gray-200"></div>
            <div className="w-full h-4 rounded bg-gray-200"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
