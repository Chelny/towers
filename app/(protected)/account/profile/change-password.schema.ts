import { Type } from "@sinclair/typebox"
import { PASSWORD_PATTERN } from "@/constants/regex"

export const setPasswordSchema = Type.Object({
  password: Type.RegExp(PASSWORD_PATTERN),
  confirmPassword: Type.RegExp(PASSWORD_PATTERN),
})

export type SetPasswordPayload = FormPayload<typeof setPasswordSchema>
export type SetPasswordFormValidationErrors = FormValidationErrors<keyof SetPasswordPayload>

export const changePasswordSchema = Type.Object({
  currentPassword: Type.String({ minLength: 1 }),
  newPassword: Type.RegExp(PASSWORD_PATTERN),
  confirmNewPassword: Type.RegExp(PASSWORD_PATTERN),
  revokeOtherSessions: Type.Boolean(),
})

export type ChangePasswordPayload = FormPayload<typeof changePasswordSchema>
export type ChangePasswordFormValidationErrors = FormValidationErrors<keyof ChangePasswordPayload>
