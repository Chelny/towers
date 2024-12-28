import { Type } from "@sinclair/typebox"
import { PASSWORD_PATTERN } from "@/constants/regex"

export const resetPasswordSchema = Type.Object({
  token: Type.String({ minLength: 1 }),
  password: Type.RegExp(PASSWORD_PATTERN),
  confirmPassword: Type.RegExp(PASSWORD_PATTERN),
})

export type ResetPasswordPayload = FormPayload<typeof resetPasswordSchema>
export type ResetPasswordFormValidationErrors = FormValidationErrors<keyof ResetPasswordPayload>
