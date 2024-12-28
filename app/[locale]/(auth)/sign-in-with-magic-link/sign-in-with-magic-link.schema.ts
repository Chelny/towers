import { Type } from "@sinclair/typebox"
import { EMAIL_PATTERN } from "@/constants/regex"

export const signInWithMagicLinkSchema = Type.Object({
  email: Type.RegExp(EMAIL_PATTERN),
})

export type SignInWithMagicLinkPayload = FormPayload<typeof signInWithMagicLinkSchema>
export type SignInWithMagicLinkFormValidationErrors = FormValidationErrors<keyof SignInWithMagicLinkPayload>
