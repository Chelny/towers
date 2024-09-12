"use client"

import { ReactNode } from "react"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { useRouter } from "next/navigation"
import Button from "@/components/ui/Button"
import { ROUTE_HOME } from "@/constants"

export default function NotFound(): ReactNode {
  const router: AppRouterInstance = useRouter()

  const handleReturnHome = (): void => {
    router.push(ROUTE_HOME.PATH)
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen">
      <div className="flex flex-col items-center justify-center max-w-sm text-center">
        <h5 className="mb-4 text-3xl">Page Not Found</h5>
        <p>It looks like the page you’re looking for doesn’t exist or has been moved.</p>
        <Button type="button" className="mt-6" onClick={handleReturnHome}>
          Return Home
        </Button>
      </div>
    </div>
  )
}
