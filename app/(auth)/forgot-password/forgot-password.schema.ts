import { Type } from "@sinclair/typebox"
import { EMAIL_PATTERN } from "@/constants/regex"

export const forgotPasswordSchema = Type.Object({
  email: Type.RegExp(EMAIL_PATTERN),
})

export type ForgotPasswordPayload = FormPayload<typeof forgotPasswordSchema>
export type ForgotPasswordErrorMessages = FormValidationErrors<keyof ForgotPasswordPayload>
