import { ReactNode } from "react"
import { Trans } from "@lingui/react/macro"
import GoToHomepageLink from "@/components/GoToHomepageLink"

export default function NotFound(): ReactNode {
  return (
    <div className="relative overflow-hidden flex flex-col items-center justify-center w-full h-screen p-4 bg-towers-primary">
      <div className="towers-game-bg animate-move-background"></div>
      <div className="flex flex-col items-center justify-center max-w-full p-4 shadow-xl bg-white backdrop-blur-sm text-center md:max-w-md">
        <h2 className="mb-4 text-3xl">
          <Trans>Page Not Found</Trans>
        </h2>
        <p>
          <Trans>It looks like the page you’re looking for doesn’t exist or has been moved.</Trans>
        </p>
        <GoToHomepageLink />
      </div>
    </div>
  )
}
