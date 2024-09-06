import { ReactNode } from "react"

export default function TableHeaderSkeleton(): ReactNode {
  return (
    <div className="[grid-area:banner] py-2 animate-pulse">
      <div className="mx-4 mt-4 h-8 w-1/3 rounded-md bg-gray-300"></div>
      <div className="mx-4 my-2 h-6 w-48 rounded-md bg-gray-300"></div>
    </div>
  )
}
