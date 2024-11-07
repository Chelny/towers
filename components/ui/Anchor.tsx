import { PropsWithChildren, ReactNode } from "react"
import Link from "next/link"
import clsx from "clsx/lite"

type AnchorProps = PropsWithChildren<{
  href: string
  className?: string
}>

export default function Anchor({ children, href, className = "" }: AnchorProps): ReactNode {
  return (
    <Link href={href} className={clsx("towers-link", className)}>
      {children}
    </Link>
  )
}
