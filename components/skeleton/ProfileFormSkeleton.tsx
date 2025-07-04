import { ReactNode } from "react"

export default function ProfileFormSkeleton(): ReactNode {
  return (
    <div className="flex flex-col gap-6 w-full animate-pulse">
      <div className="h-6 rounded-sm bg-gray-200 w-64"></div>
      <div className="flex flex-col gap-2">
        <div className="h-6 rounded-sm bg-gray-200 w-48"></div>
        <div className="h-8 rounded-sm bg-gray-200"></div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-6 rounded-sm bg-gray-200 w-48"></div>
        <div className="h-10 rounded-sm bg-gray-200"></div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-6 rounded-sm bg-gray-200 w-48"></div>
        <div className="h-8 rounded-sm bg-gray-200"></div>
      </div>
      <div className="h-10 rounded-sm bg-gray-200"></div>
    </div>
  )
}
