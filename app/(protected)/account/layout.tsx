import { ReactNode } from "react"
import clsx from "clsx/lite"

type AccountLayoutProps = {
  children: ReactNode
}

export default function AccountLayout({ children }: AccountLayoutProps): ReactNode {
  return (
    <div className="h-full p-4">
      <div className={clsx("flex flex-col p-4 pb-8 mx-auto", "sm:px-0 sm:max-w-sm", "md:max-w-md")}>{children}</div>
    </div>
  )
}
