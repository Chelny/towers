import { Type } from "@sinclair/typebox"

export const verifyEmailSchema = Type.Object({
  token: Type.String({ minLength: 1 })
})

export type VerifyEmailFormData = SchemaFormData<typeof verifyEmailSchema>
export type VerifyEmailFormErrorMessages = SchemaFormErrorMessages<keyof VerifyEmailFormData>
