"use client"

import { ReactNode } from "react"
import { useRouter } from "next/navigation"
import clsx from "clsx/lite"
import Button from "@/components/ui/Button"
import { ROUTE_HOME } from "@/constants/routes"
import { authClient } from "@/lib/auth-client"
import { useAppDispatch } from "@/lib/hooks"
import { destroySocket } from "@/redux/features/socket-slice"
import { AppDispatch } from "@/redux/store"

export default function SmallScreenWarning(): ReactNode {
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const dispatch: AppDispatch = useAppDispatch()

  const handleSignOut = async (): Promise<void> => {
    dispatch(destroySocket())
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push(ROUTE_HOME.PATH)
        },
      },
    })
  }

  return (
    <div>
      <div
        className={clsx(
          "small-screen-warning",
          "fixed inset-0 z-50 flex flex-col justify-center items-center gap-2 p-4 bg-white text-center",
        )}
      >
        <h2 className="text-2xl font-bold mb-2">Screen Too Small</h2>
        <p className="text-lg">
          Resize the window (recommended size: 1350px by 768px)
          <br />
          or use a computer for a better experience.
        </p>
        <Button className="mt-2" type="button" disabled={!session} onClick={handleSignOut}>
          Sign out
        </Button>
      </div>
    </div>
  )
}
