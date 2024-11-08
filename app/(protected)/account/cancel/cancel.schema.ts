import { Type } from "@sinclair/typebox"
import { EMAIL_PATTERN } from "@/constants/regex"

export const cancelAccountSchema = Type.Object({
  email: Type.RegExp(EMAIL_PATTERN),
})

export type CancelAccountPayload = FormPayload<typeof cancelAccountSchema>
export type CancelAccountFormValidationErrors = FormValidationErrors<keyof CancelAccountPayload>
