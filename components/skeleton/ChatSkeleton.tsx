import React, { ReactNode } from "react"

export default function ChatSkeleton(): ReactNode {
  return (
    <>
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="flex items-center gap-1 p-2">
          <div className="w-48 h-4 bg-gray-200 rounded"></div>
          <div className="w-full h-4 bg-gray-200 rounded"></div>
        </div>
      ))}
    </>
  )
}
