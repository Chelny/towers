import { Type } from "@sinclair/typebox"
import { EMAIL_PATTERN } from "@/constants/regex"

export const signInWithMagicLinkSchema = Type.Object({
  email: Type.RegExp(EMAIL_PATTERN)
})

export type SignInWithMagicLinkFormData = SchemaFormData<typeof signInWithMagicLinkSchema>
export type SignInWithMagicLinkFormErrorMessages = SchemaFormErrorMessages<keyof SignInWithMagicLinkFormData>
