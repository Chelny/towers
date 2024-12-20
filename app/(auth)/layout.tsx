import { PropsWithChildren, ReactNode } from "react"
import clsx from "clsx/lite"
import Breadcrumb from "@/components/ui/Breadcrumb"

type AuthLayoutProps = PropsWithChildren<{}>

export default function AuthLayout({ children }: AuthLayoutProps): ReactNode {
  return (
    <div className={clsx("flex flex-col h-full bg-white", "md:flex-row md:gap-4")}>
      <div
        className={clsx(
          "p-4 bg-teal-800",
          "md:relative md:overflow-hidden md:flex-1 md:flex md:justify-center md:items-center md:h-full",
        )}
      >
        <div className="md:before:content-[' '] md:before:absolute md:before:-top-1/2 md:before:-left-1/2 md:before:w-[200%] md:before:h-[200%] md:before:p-4 md:before:bg-clip-content md:before:bg-origin-content md:before:bg-repeat-round md:before:bg-auto md:before:bg-[url('/logo.png')] md:before:opacity-50 md:before:-rotate-12"></div>
        <div className="md:absolute md:z-10">
          <h1
            className={clsx(
              "font-semibold text-white text-4xl",
              "md:px-[3vw] md:py-[2vw] md:border md:border-slate-300 md:rounded md:shadow-xl md:text-[3vw] md:backdrop-blur-sm",
            )}
          >
            Towers Game
          </h1>
        </div>
      </div>
      <div
        className={clsx(
          "flex flex-col h-full p-4 pb-8 overflow-y-auto",
          "md:flex-1 md:flex md:justify-center md:items-center md:pb-4",
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
