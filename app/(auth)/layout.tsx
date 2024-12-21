import { PropsWithChildren, ReactNode } from "react"
import Image from "next/image"
import clsx from "clsx/lite"
import Breadcrumb from "@/components/ui/Breadcrumb"
import { APP_CONFIG } from "@/constants/app"

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
        <div className="md:before:content-[' '] md:before:absolute md:before:-top-1/2 md:before:-left-1/2 md:before:w-[200%] md:before:h-[200%] md:before:p-4 md:before:bg-clip-content md:before:bg-origin-content md:before:bg-repeat-round md:before:bg-auto md:before:bg-[url('/logo.png')] md:before:opacity-50 md:before:-rotate-12 md:before:animate-move-background md:before:duration-[5s]"></div>
        <div className="flex gap-2 md:absolute md:z-10">
          <Image className="md:hidden" src="/favicon.svg" width={36} height={24} alt={APP_CONFIG.NAME} />
          <h1
            className={clsx(
              "font-semibold text-white text-4xl",
              "md:px-[3vw] md:py-[2vw] md:border md:border-neutral-300 md:rounded md:shadow-xl md:text-[3vw] md:backdrop-blur-sm",
            )}
          >
            {APP_CONFIG.NAME}
          </h1>
        </div>
      </div>
      <div
        className={clsx(
          "flex flex-col h-full p-4 pb-8 overflow-y-auto",
          "md:flex-1 md:flex md:items-center md:pb-4",
          "tall:justify-center",
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
