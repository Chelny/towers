import { ReactNode } from "react"
import clsx from "clsx/lite"
import Breadcrumb from "@/components/ui/Breadcrumb"

type AccountLayoutProps = {
  children: ReactNode
}

export default function AccountLayout({ children }: AccountLayoutProps): ReactNode {
  return (
    <div className="container h-full bg-white">
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
