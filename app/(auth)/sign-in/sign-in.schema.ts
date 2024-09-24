import { Type } from "@sinclair/typebox"
import { EMAIL_PATTERN } from "@/constants/regex"

export const signInSchema = Type.Object({
  email: Type.RegExp(EMAIL_PATTERN),
  password: Type.String({ minLength: 1 })
})

export type SignInFormData = SchemaFormData<typeof signInSchema>
export type SignInFormErrorMessages = SchemaFormErrorMessages<keyof SignInFormData>
