import { ReactNode } from "react"
import Link from "next/link"
import clsx from "clsx/lite"

interface AnchorProps {
  href: string
  children: ReactNode
  className?: string
}

export default function Anchor({ href, children, className = "" }: AnchorProps): ReactNode {
  return (
    <Link href={href} className={clsx("towers-link", className)}>
      {children}
    </Link>
  )
}
