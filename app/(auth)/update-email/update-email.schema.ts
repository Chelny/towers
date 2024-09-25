import { Type } from "@sinclair/typebox"

export const updateEmailSchema = Type.Object({
  token: Type.String({ minLength: 1 })
})

export type UpdateEmailFormData = SchemaFormData<typeof updateEmailSchema>
export type UpdateEmailFormErrorMessages = SchemaFormErrorMessages<keyof UpdateEmailFormData>
