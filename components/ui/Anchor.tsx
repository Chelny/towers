import { PropsWithChildren, ReactNode } from "react"
import Link from "next/link"
import clsx from "clsx/lite"

type AnchorProps = PropsWithChildren<{
  href: string
  className?: string
  dataTestId?: string
}>

export default function Anchor({ children, href, className = "", dataTestId = undefined }: AnchorProps): ReactNode {
  return (
    <Link className={clsx("towers-link", className)} href={href} data-testid={dataTestId}>
      {children}
    </Link>
  )
}
