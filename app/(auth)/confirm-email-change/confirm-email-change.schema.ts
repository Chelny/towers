import { Type } from "@sinclair/typebox"

export const confirmEmailChangeSchema = Type.Object({
  token: Type.String({ minLength: 1 }),
})

export type ConfirmEmailChangePayload = FormPayload<typeof confirmEmailChangeSchema>
export type ConfirmEmailChangeFormValidationErrors = FormValidationErrors<keyof ConfirmEmailChangePayload>
