"use client"

import { ReactNode } from "react"
import { signIn } from "next-auth/react"
import { FaGithub } from "react-icons/fa6"
import { FcGoogle } from "react-icons/fc"
import Button from "@/components/ui/Button"
import { SIGN_IN_REDIRECT } from "@/constants/routes"

type SocialLoginButtonsProps = {
  disabled: boolean
}

export function SocialLoginButtons({ disabled }: SocialLoginButtonsProps): ReactNode {
  const handleClick = (provider: "google" | "github"): void => {
    signIn(provider, {
      callbackUrl: SIGN_IN_REDIRECT
    })
  }

  return (
    <div className="flex flex-col w-full gap-4">
      <Button
        type="button"
        className="flex justify-center items-center w-full gap-x-2"
        disabled={disabled}
        dataTestId="sign-in-github-button"
        onClick={() => handleClick("github")}
      >
        <FaGithub className="w-5 h-5" />
        <span>Login with GitHub</span>
      </Button>
      <Button
        type="button"
        className="flex justify-center items-center w-full gap-x-2"
        disabled={disabled}
        dataTestId="sign-in-google-button"
        onClick={() => handleClick("google")}
      >
        <FcGoogle className="w-5 h-5" />
        <span>Login with Google</span>
      </Button>
    </div>
  )
}
