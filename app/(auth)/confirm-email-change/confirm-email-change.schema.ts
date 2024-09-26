import { Type } from "@sinclair/typebox"

export const confirmEmailChangeSchema = Type.Object({
  token: Type.String({ minLength: 1 })
})

export type ConfirmEmailChangeFormData = SchemaFormData<typeof confirmEmailChangeSchema>
export type ConfirmEmailChangeFormErrorMessages = SchemaFormErrorMessages<keyof ConfirmEmailChangeFormData>
