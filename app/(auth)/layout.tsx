import { ReactNode } from "react"
import clsx from "clsx/lite"
import Breadcrumb from "@/components/ui/Breadcrumb"

type AuthLayoutProps = {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps): ReactNode {
  return (
    <div className="h-full bg-white">
      <h1 className="p-4 bg-amber-400 text-4xl">Towers Game</h1>
      <div
        className={clsx(
          "flex flex-col px-4 pb-8 mx-auto bg-white",
          "sm:px-0 sm:max-w-sm sm:bg-transparent",
          "md:max-w-md"
        )}
      >
        <Breadcrumb />
        {children}
      </div>
    </div>
  )
}
