"use client"

import { ReactNode } from "react"
import { usePathname } from "next/navigation"
import Anchor from "@/components/ui/Anchor"
import { ROUTE_ERROR, ROUTE_HOME } from "@/constants/routes"

export default function Breadcrumb(): ReactNode {
  const pathname: string = usePathname()
  const pathSegments: string[] = pathname.split("/").filter((path: string) => path)

  // Do not show breadcrumb on error page
  if (pathname === ROUTE_ERROR.PATH) return null

  return (
    <nav className="mb-6" aria-label="breadcrumb">
      <ol className="flex">
        {/* Home link */}
        <li>
          <Anchor href={ROUTE_HOME.PATH}>Home</Anchor>
          {pathSegments.length > 0 && <span className="mx-2 text-gray-400">/</span>}
        </li>

        {/* Generate breadcrumb links based on path segments */}
        {pathSegments.map((segment: string, index: number) => {
          // Build the path for each segment
          const href: string = "/" + pathSegments.slice(0, index + 1).join("/")

          // Check if it’s the last segment
          const isLast: boolean = index === pathSegments.length - 1

          const formattedSegment: string = segment
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")

          return (
            <li key={href}>
              {!isLast ? (
                <Anchor href={href}>{formattedSegment}</Anchor>
              ) : (
                <span className="text-black font-medium">{formattedSegment}</span>
              )}
              {!isLast && <span className="mx-2 text-gray-400">/</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
