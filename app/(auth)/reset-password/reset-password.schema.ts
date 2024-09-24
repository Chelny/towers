import { Type } from "@sinclair/typebox"
import { PASSWORD_PATTERN } from "@/constants/regex"

export const resetPasswordSchema = Type.Object({
  token: Type.String({ minLength: 1 }),
  password: Type.RegExp(PASSWORD_PATTERN),
  confirmPassword: Type.RegExp(PASSWORD_PATTERN)
})

export type ResetPasswordFormData = SchemaFormData<typeof resetPasswordSchema>
export type ResetPasswordFormErrorMessages = SchemaFormErrorMessages<keyof ResetPasswordFormData>
