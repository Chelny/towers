"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ROUTE_HOME } from "@/constants"

export default function Breadcrumb() {
  const pathname: string = usePathname()
  const pathSegments: string[] = pathname.split("/").filter((path: string) => path)

  return (
    <nav className="mt-4 mb-8" aria-label="breadcrumb">
      <ol className="flex">
        {/* Home link */}
        <li>
          <Link href={ROUTE_HOME.PATH} className="text-blue-500 hover:underline">
            Home
          </Link>
          {pathSegments.length > 0 && <span className="mx-2 text-gray-400">/</span>}
        </li>

        {/* Generate breadcrumb links based on path segments */}
        {pathSegments.map((segment: string, index: number) => {
          // Build the path for each segment
          const href: string = "/" + pathSegments.slice(0, index + 1).join("/")

          // Check if it's the last segment
          const isLast: boolean = index === pathSegments.length - 1

          const formattedSegment: string = segment
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")

          return (
            <li key={href}>
              {!isLast ? (
                <Link href={href} className="text-blue-500 hover:underline">
                  {formattedSegment}
                </Link>
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
