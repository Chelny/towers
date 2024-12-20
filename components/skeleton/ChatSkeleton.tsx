import { ReactNode } from "react"

export default function ChatSkeleton(): ReactNode {
  return (
    <>
      {Array.from({ length: 10 }).map((_, index: number) => (
        <div key={index} className="flex items-center gap-1 p-2 animate-pulse">
          <div className="w-48 h-4 rounded bg-gray-200"></div>
          <div className="w-full h-4 rounded bg-gray-200"></div>
        </div>
      ))}
    </>
  )
}
