import { Type } from "@sinclair/typebox"
import { PASSWORD_PATTERN } from "@/constants/regex"

export const passwordSchema = Type.Object({
  currentPassword: Type.String({ minLength: 8 }),
  newPassword: Type.RegExp(PASSWORD_PATTERN),
  confirmNewPassword: Type.RegExp(PASSWORD_PATTERN),
})

export type UpdatePasswordPayload = FormPayload<typeof passwordSchema>
export type UpdatePasswordFormValidationErrors = FormValidationErrors<keyof UpdatePasswordPayload>
