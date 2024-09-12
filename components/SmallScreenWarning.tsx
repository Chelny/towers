"use client"

import { ReactNode } from "react"
import clsx from "clsx/lite"
import { signOut } from "next-auth/react"
import { useDispatch } from "react-redux"
import Button from "@/components/ui/Button"
import { useSessionData } from "@/hooks"
import { destroySocket } from "@/redux/features"
import { AppDispatch } from "@/redux/store"

export default function SmallScreenWarning(): ReactNode {
  const { data: session } = useSessionData()
  const dispatch: AppDispatch = useDispatch()

  const handleSignOut = (): void => {
    dispatch(destroySocket())
    signOut()
  }

  return (
    <div
      className={clsx(
        "small-screen-warning",
        "fixed inset-0 z-50 flex flex-col justify-center items-center gap-2 p-4 bg-white text-center"
      )}
    >
      <h2 className="text-2xl font-bold mb-2">Screen Too Small</h2>
      <p className="text-lg">
        Resize the window (recommended size: 1350px by 768px)
        <br />
        or use a computer for a better experience.
      </p>
      {session && (
        <Button className="mt-2" type="button" onClick={handleSignOut}>
          <span>Sign out</span>
        </Button>
      )}
    </div>
  )
}
