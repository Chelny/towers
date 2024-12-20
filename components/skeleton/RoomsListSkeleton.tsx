import { ReactNode } from "react"

export default function RoomsListSkeleton(): ReactNode {
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,_minmax(14rem,_1fr))] gap-8 animate-pulse">
      {Array.from({ length: 10 }).map((_, index: number) => (
        <li key={index} className="flex flex-col gap-2 p-4 border border-gray-200 rounded bg-white">
          <div className="font-medium h-5 rounded bg-gray-200 w-3/4"></div>
          <div className="h-4 rounded bg-gray-200 w-1/2"></div>
          <div className="h-4 rounded bg-gray-200 w-1/4"></div>
          <div className="h-10 rounded bg-gray-200 w-full"></div>
        </li>
      ))}
    </ul>
  )
}
