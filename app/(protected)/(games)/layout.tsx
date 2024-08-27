import { ReactNode } from "react"
import SmallScreenWarning from "@/components/SmallScreenWarning"

type GamesLayoutProps = {
  children: ReactNode
}

export default function GamesLayout({ children }: GamesLayoutProps): ReactNode {
  return (
    <>
      <SmallScreenWarning />
      {children}
    </>
  )
}
