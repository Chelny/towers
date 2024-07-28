import { ReactNode } from "react"

type AuthTemplateProps = {
  children: ReactNode
}

export default function AuthTemplate({ children }: AuthTemplateProps): ReactNode {
  return <>{children}</>
}
