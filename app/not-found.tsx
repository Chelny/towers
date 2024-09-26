import { ReactNode } from "react"
import GoToHomepageLink from "@/components/GoToHomepageLink"

export default function NotFound(): ReactNode {
  return (
    <div className="flex flex-col items-center justify-center w-full h-screen">
      <div className="flex flex-col items-center justify-center max-w-sm text-center">
        <h5 className="mb-4 text-3xl">Page Not Found</h5>
        <p>It looks like the page you’re looking for doesn’t exist or has been moved.</p>
        <GoToHomepageLink />
      </div>
    </div>
  )
}
