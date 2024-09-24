import { Type } from "@sinclair/typebox"
import { EMAIL_PATTERN } from "@/constants/regex"

export const verifyEmailSchema = Type.Object({
  email: Type.RegExp(EMAIL_PATTERN),
  token: Type.String({ minLength: 1 })
})

export type VerifyEmailFormData = SchemaFormData<typeof verifyEmailSchema>
export type VerifyEmailFormErrorMessages = SchemaFormErrorMessages<keyof VerifyEmailFormData>
