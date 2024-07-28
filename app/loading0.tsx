import { ReactElement } from "react"
import { CgSpinner } from "react-icons/cg"

export default function LoadingHome(): ReactElement {
  return (
    <div className="flex justify-center">
      <CgSpinner className="w-12 h-12 animate-spin" />
    </div>
  )
}
