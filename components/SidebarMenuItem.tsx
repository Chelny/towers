"use client"

import { PropsWithChildren, ReactNode, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
  const [isAccordionOpen, setAccordionOpen] = useState<boolean>(false)

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

  return (
    <div
      className={clsx(
        "py-1 rounded-md overflow-hidden",
        isExpanded ? "w-full" : "w-auto",
        href && isExpanded && pathname === href ? "bg-slate-700" : "text-white/70",
      )}
    >
      {/* Single menu item */}
      {href ? (
        <Link
          href={href}
          className={clsx(
            "flex items-center gap-4 w-full p-2",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            href && pathname === href && "font-semibold",
          )}
          aria-label={ariaLabel}
        >
          <span
            className={clsx(
              "p-2 border-2 rounded-md",
              href && pathname === href
                ? "border-slate-300/50 bg-slate-400/50 text-white/90"
                : "border-slate-600 bg-slate-700 text-white/70",
            )}
          >
            <Icon className="w-5 h-5" aria-hidden="true" />
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
            isExpanded && accordionLinks.some((link: AccordionLink) => pathname?.includes(link.href)) && "bg-slate-600",
          )}
          disabled={disabled}
          aria-label={ariaLabel}
          onClick={handleClick}
        >
          <span
            className={clsx(
              "relative p-2 border-2 rounded-md",
              accordionLinks.some((link: AccordionLink) => pathname?.includes(link.href))
                ? "border-slate-300/50 bg-slate-400/50 text-white/90"
                : "border-slate-600 bg-slate-700 text-white/70",
            )}
          >
            <Icon className="w-5 h-5" aria-hidden="true" />
            {/* Accordion left line */}
            {accordionLinks.length > 0 && isExpanded && isAccordionOpen && (
              <span
                className={clsx(
                  "absolute left-1/2 top-[100%] w-[2px] bg-white/15 transform -translate-x-1/2 transition-all duration-300",
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
            "pl-12 space-y-2 overflow-hidden transition-all duration-200",
            isAccordionOpen ? "max-h-screen mt-2" : "max-h-0",
          )}
        >
          {accordionLinks.map((link: AccordionLink) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "flex items-center gap-4 w-full p-2 rounded-md ms-2",
                pathname?.includes(link.href) && "text-white/90 font-semibold",
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
