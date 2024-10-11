import { ReactNode } from "react"
import clsx from "clsx/lite"
import Breadcrumb from "@/components/ui/Breadcrumb"

type AuthLayoutProps = {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps): ReactNode {
  return (
    <div className={clsx("flex flex-col h-full bg-white", "md:flex-row md:gap-4")}>
      <div
        className={clsx("p-4 bg-teal-800 text-white", "md:flex-1 md:flex md:justify-center md:items-center md:h-full")}
      >
        <h1 className={clsx("text-4xl", "md:text-5xl")}>Towers Game</h1>
      </div>
      <div
        className={clsx(
          "flex flex-col h-full p-4 pb-8 overflow-y-auto",
          "md:flex-1 md:flex md:justify-center md:items-center md:pb-4"
        )}
      >
        <div className={clsx("sm:w-96 sm:mx-auto", "md:w-full md:max-w-md")}>
          <Breadcrumb />
          {children}
        </div>
      </div>
    </div>
  )
}
