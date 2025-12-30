import { ReactNode } from "react";
import Image from "next/image";
import clsx from "clsx/lite";
import LocaleSwitcher from "@/components/LanguageSwitcher";
import { APP_CONFIG } from "@/constants/app";

type AuthLayoutProps = LayoutProps<"/[locale]"> & {
  breadcrumb: ReactNode
};

export default function AuthLayout({ children, breadcrumb }: AuthLayoutProps): ReactNode {
  return (
    <div className={clsx("flex flex-col h-full bg-white", "md:flex-row md:gap-4", "dark:bg-dark-background")}>
      <div
        className={clsx(
          "p-4 bg-youpi-primary",
          "md:relative md:overflow-hidden md:flex-1 md:flex md:justify-center md:items-center md:h-full",
        )}
      >
        <div className="youpi-bg before:animate-move-background"></div>
        <div className="flex gap-2 md:absolute md:z-10">
          <Image src="/favicon.svg" className="md:hidden" width={36} height={24} alt={APP_CONFIG.NAME} />
          <h1
            className={clsx(
              "[text-shadow:2px_2px_0_#000000,4px_4px_0_#000000] font-black text-white text-4xl uppercase",
              "md:px-[3vw] md:py-[2vw] md:rounded-sm md:backdrop-blur-xs md:text-[5vw]",
            )}
            dir="ltr"
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
  );
}
