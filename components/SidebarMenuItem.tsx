"use client"

import { PropsWithChildren, ReactNode, useEffect, useState } from "react"
import Link from "next/link"
import { ReadonlyURLSearchParams, usePathname, useSearchParams } from "next/navigation"
import clsx from "clsx/lite"
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai"
import { IconType } from "react-icons/lib"

export type AccordionLink = { href: string; label: string }

type SidebarMenuItemProps = PropsWithChildren<{
  Icon: IconType
  ariaLabel: string
  isExpanded: boolean
  isLinkTextVisible: boolean
  href?: string
  accordionLinks?: AccordionLink[]
  disabled?: boolean
  onClick?: () => void
}>

export default function SidebarMenuItem({
  children,
  Icon,
  ariaLabel,
  isExpanded = false,
  isLinkTextVisible = false,
  href = undefined,
  accordionLinks = [],
  disabled = false,
  onClick,
}: SidebarMenuItemProps): ReactNode {
  const pathname: string = usePathname()
  const searchParams: ReadonlyURLSearchParams = useSearchParams()
  const [isMounted, setIsMounted] = useState<boolean>(false)
  const [isAccordionOpen, setAccordionOpen] = useState<boolean>(false)
  const currentParams: Record<string, string> = Object.fromEntries(searchParams.entries())

  const isActive = (path: string): boolean => {
    const [baseHref, queryString] = path.split("?")

    if (pathname !== baseHref) return false

    if (queryString) {
      const linkParams: URLSearchParams = new URLSearchParams(queryString)

      // Check if the link params match the current query parameters
      for (const [key, value] of linkParams.entries()) {
        if (currentParams[key] !== value) {
          return false
        }
      }

      // Ensure that all parameters in the link match the current URL parameters
      const linkParamKeys: string[] = Array.from(linkParams.keys())
      const currentParamKeys: string[] = Object.keys(currentParams)

      // If the current URL contains extra parameters, return false
      if (linkParamKeys.length !== currentParamKeys.length) {
        return false
      }

      // Check if every query parameter in the link matches the current URL
      for (let key of linkParamKeys) {
        if (currentParams[key] !== linkParams.get(key)) {
          return false
        }
      }

      return true
    }

    // If there are no query parameters in the link, ensure the current URL also has no query parameters
    return Object.keys(currentParams).length === 0
  }

  const handleClick = (): void => {
    if (accordionLinks.length > 0) {
      if (!isExpanded) {
        onClick?.()
        setTimeout(() => setAccordionOpen(true), 300)
      } else {
        setAccordionOpen((prev: boolean) => !prev)
      }
    } else {
      onClick?.()
    }
  }

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <div
      className={clsx(
        "py-1 rounded-md overflow-hidden",
        isExpanded ? "w-full" : "w-auto",
        href && isExpanded && isActive(href) ? "bg-slate-700" : "text-white/70",
      )}
    >
      {/* Single menu item */}
      {href ? (
        <Link
          href={href}
          className={clsx(
            "flex items-center gap-4 w-full p-2",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            href && isActive(href) && "text-white/90 font-medium",
          )}
          aria-label={ariaLabel}
        >
          <span
            className={clsx(
              "p-2 border-2 rounded-md",
              href && isActive(href)
                ? "border-slate-300/50 bg-slate-400/50 text-white/90"
                : "border-slate-600 bg-slate-700 text-white/70",
            )}
          >
            <Icon className={clsx("w-5 h-5", "rtl:-scale-y-100 rtl:-rotate-180")} aria-hidden="true" />
          </span>
          <span
            className={clsx(
              "transition-opacity duration-300",
              isExpanded ? "block" : "hidden",
              isLinkTextVisible ? "opacity-100" : "opacity-0",
            )}
          >
            {children}
          </span>
        </Link>
      ) : (
        <button
          type="button"
          className={clsx(
            "flex items-center gap-4 w-full p-2 rounded-md",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            isExpanded &&
              accordionLinks.some((link: AccordionLink) => isActive(link.href)) &&
              "bg-slate-600 text-white/90 font-medium",
          )}
          disabled={isMounted ? disabled : false}
          aria-label={ariaLabel}
          onClick={handleClick}
        >
          <span
            className={clsx(
              "relative p-2 border-2 rounded-md",
              accordionLinks.some((link: AccordionLink) => isActive(link.href))
                ? "border-slate-300/50 bg-slate-400/50 text-white/90"
                : "border-slate-600 bg-slate-700 text-white/70",
            )}
          >
            <Icon className={clsx("w-5 h-5", "rtl:-scale-y-100 rtl:-rotate-180")} aria-hidden="true" />
            {/* Accordion left line */}
            {accordionLinks.length > 0 && isExpanded && isAccordionOpen && (
              <span
                className={clsx(
                  "absolute start-1/2 top-[100%] w-[2px] bg-white/15 transform -translate-x-1/2 transition-all duration-300",
                  "rtl:translate-x-1/2",
                  isAccordionOpen ? "h-screen" : "h-0",
                )}
              />
            )}
          </span>
          <span
            className={clsx(
              "flex justify-between items-center w-full transition-opacity duration-300",
              isExpanded ? "block" : "hidden",
              isLinkTextVisible ? "opacity-100" : "opacity-0",
            )}
          >
            {accordionLinks.length > 0 ? (
              <>
                <span>{children}</span>
                {isAccordionOpen ? <AiOutlineMinus /> : <AiOutlinePlus />}
              </>
            ) : (
              children
            )}
          </span>
        </button>
      )}

      {/* Accordion */}
      {accordionLinks.length > 0 && isExpanded && (
        <div
          className={clsx(
            "ps-12 space-y-2 overflow-hidden transition-all duration-200",
            isAccordionOpen ? "max-h-screen mt-2" : "max-h-0",
          )}
        >
          {accordionLinks.map((link: AccordionLink) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "flex items-center gap-4 w-full p-2 rounded-md ms-2",
                isActive(link.href) && "text-white/85 font-medium",
              )}
              aria-label={ariaLabel}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
