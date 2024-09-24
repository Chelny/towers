import { Type } from "@sinclair/typebox"
import { EMAIL_PATTERN } from "@/constants/regex"

export const accountSchema = Type.Object({
  email: Type.RegExp(EMAIL_PATTERN)
})

export type AccountFormData = SchemaFormData<typeof accountSchema>
export type AccountFormErrorMessages = SchemaFormErrorMessages<keyof AccountFormData>
