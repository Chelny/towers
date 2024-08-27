"use server"

import { NextResponse } from "next/server"
import { type Static, Type } from "@sinclair/typebox"
import { Value, ValueError } from "@sinclair/typebox/value"
import { DELETE } from "@/app/api/account/route"

const accountSchema = Type.Object({
  email: Type.String({ minLength: 1 })
})

export type AccountData = Static<typeof accountSchema>

export type AccountErrorMessages<T extends string> = {
  [K in T]?: string
}

export async function account(prevState: any, formData: FormData) {
  const rawFormData: AccountData = {
    email: formData.get("email") as string
  }

  const errors: ValueError[] = Array.from(Value.Errors(accountSchema, rawFormData))
  const errorMessages: AccountErrorMessages<keyof AccountData> = {}

  for (const error of errors) {
    switch (error.path.replace("/", "")) {
      case "email":
        errorMessages.email = "The email is invalid."
        break
      default:
        console.error(`Delete Account Action: Unknown error at ${error.path}`)
        break
    }
  }

  if (Object.keys(errorMessages).length === 0) {
    const response: NextResponse = await DELETE(rawFormData)
    return await response.json()
  }

  return {
    success: false,
    errors: errorMessages
  }
}
