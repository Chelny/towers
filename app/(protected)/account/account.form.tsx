"use client"

import { ClipboardEvent, ReactNode, useEffect, useState } from "react"
import { useFormState } from "react-dom"
import { useRouter } from "next/navigation"
import clsx from "clsx/lite"
import { signOut } from "next-auth/react"
import { FaMinus, FaPlus } from "react-icons/fa6"
import { account, AccountData, AccountErrorMessages } from "@/app/(protected)/account/account.actions"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { ROUTE_SIGN_IN } from "@/constants"

const initialState = {
  success: false,
  message: "",
  errors: {} as AccountErrorMessages<keyof AccountData>
}

export function AccountForm(): ReactNode {
  const router = useRouter()
  const [state, formAction] = useFormState(account, initialState)
  const [isExpanded, setIsExpanded] = useState<boolean>(false)

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(async () => {
        try {
          await signOut()
          router.push(ROUTE_SIGN_IN.PATH)
        } catch (error) {
          console.error(`Account deletion - Sign out error: ${error}`)
        }
      }, 15000)

      return () => clearTimeout(timer)
    }
  }, [state, router])

  const handleToggle = (event: React.SyntheticEvent<HTMLDetailsElement>): void => {
    setIsExpanded(event.currentTarget.open)
  }

  return (
    <form className="w-full" action={formAction} noValidate>
      <details onToggle={handleToggle}>
        <summary className="flex justify-between items-center">
          <span className={clsx("w-full text-red-500", "hover:underline")}>Cancel Account</span>
          {isExpanded ? (
            <FaMinus className={clsx("text-gray-500", "group-hover:text-gray-400")} />
          ) : (
            <FaPlus className={clsx("text-gray-500", "group-hover:text-gray-400")} />
          )}
        </summary>

        <div className={clsx("mt-4", "hover:cursor-default")}>
          <Input
            type="email"
            id="email"
            label="Please enter your email to confirm account deletion"
            autoComplete="off"
            required
            onPaste={(event: ClipboardEvent<HTMLInputElement>) => event.preventDefault()}
            placeholder="Enter your email"
            errorMessage={state.errors?.email}
          />

          <Button type="submit" className="mt-4 bg-red-500 text-white">
            Confirm Deletion
          </Button>
        </div>

        {state.message && (
          <div className={clsx("mt-4", state.success ? "text-green-600" : "text-red-500", "hover:cursor-text")}>
            {state.message}
          </div>
        )}
      </details>
    </form>
  )
}
