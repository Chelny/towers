import { Type } from "@sinclair/typebox"
import { BIRTH_DATE_PATTERN, EMAIL_PATTERN, NAME_PATTERN, PASSWORD_PATTERN, USERNAME_PATTERN } from "@/constants/regex"

export const signUpSchema = Type.Object({
  name: Type.RegExp(NAME_PATTERN),
  birthdate: Type.Optional(Type.RegExp(BIRTH_DATE_PATTERN)),
  email: Type.RegExp(EMAIL_PATTERN),
  username: Type.RegExp(USERNAME_PATTERN),
  password: Type.RegExp(PASSWORD_PATTERN),
  confirmPassword: Type.RegExp(PASSWORD_PATTERN),
  termsAndConditions: Type.String()
})

export type SignUpFormData = SchemaFormData<typeof signUpSchema>
export type SignUpFormErrorMessages = SchemaFormErrorMessages<keyof SignUpFormData>
