import { PropsWithChildren, ReactNode } from "react"
import Image from "next/image"
import clsx from "clsx/lite"
import LocaleSwitcher from "@/components/LanguageSwitcher"
import { APP_CONFIG } from "@/constants/app"

type AuthLayoutProps = PropsWithChildren<{
  breadcrumb: ReactNode
}>

export default function AuthLayout({ children, breadcrumb }: AuthLayoutProps): ReactNode {
  return (
    <div className={clsx("flex flex-col h-full bg-white", "md:flex-row md:gap-4", "dark:bg-dark-background")}>
      <div
        className={clsx(
          "p-4 bg-towers-primary",
          "md:relative md:overflow-hidden md:flex-1 md:flex md:justify-center md:items-center md:h-full",
        )}
      >
        <div className="towers-game-bg before:animate-move-background"></div>
        <div className="flex gap-2 md:absolute md:z-10">
          <Image className="md:hidden" src="/favicon.svg" width={36} height={24} alt={APP_CONFIG.NAME} />
          <h1
            className={clsx(
              "font-semibold text-white text-4xl",
              "md:px-[3vw] md:py-[2vw] md:border md:border-neutral-300 md:rounded-sm md:shadow-xl md:backdrop-blur-xs md:text-[3vw]",
            )}
          >
            {APP_CONFIG.NAME}
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
          <div className="flex justify-center items-center gap-2 w-full mt-4 mb-6">
            <div className="flex-1">{breadcrumb}</div>
            <div>
              <LocaleSwitcher />
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
