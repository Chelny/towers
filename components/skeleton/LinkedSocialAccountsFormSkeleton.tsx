import { ReactNode } from "react"

export default function LinkedSocialAccountsFormSkeleton(): ReactNode {
  return (
    <div className="flex flex-col gap-6 w-full animate-pulse">
      <div className="w-52 h-6 rounded-sm bg-gray-200"></div>
      {Array.from({ length: 7 }).map((_, index: number) => (
        <div key={index} className="flex items-center justify-between gap-2">
          <div className="flex-1 h-6 rounded-sm bg-gray-200"></div>
          <div className="flex-1 h-10 rounded-sm bg-gray-200"></div>
        </div>
      ))}
    </div>
  )
}
