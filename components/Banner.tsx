"use client"

import { ReactNode } from "react"
import clsx from "clsx/lite"

export default function Banner(): ReactNode {
  return (
    <div className={clsx("flex-1 flex justify-end py-2", "lg:justify-center")}>
      <div className="flex items-center justify-center w-[728px] h-[90px] border-2 border-gray-300 bg-slate-50 text-gray-500">
        <span className="text-lg">advertisement</span>
      </div>
    </div>
  )
}
