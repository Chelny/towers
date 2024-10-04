import { Type } from "@sinclair/typebox"
import { EMAIL_PATTERN } from "@/constants/regex"

export const cancelAccountSchema = Type.Object({
  email: Type.RegExp(EMAIL_PATTERN)
})

export type CancelAccountFormData = SchemaFormData<typeof cancelAccountSchema>
export type CancelAccountFormErrorMessages = SchemaFormErrorMessages<keyof CancelAccountFormData>
