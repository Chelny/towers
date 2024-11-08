import { Type } from "@sinclair/typebox"

export const verifyEmailSchema = Type.Object({
  token: Type.String({ minLength: 1 }),
})

export type VerifyEmailPayload = FormPayload<typeof verifyEmailSchema>
export type VerifyEmailFormValidationErrors = FormValidationErrors<keyof VerifyEmailPayload>
