import { Type } from "@sinclair/typebox"
import { BIRTH_DATE_PATTERN, EMAIL_PATTERN, NAME_PATTERN, USERNAME_PATTERN } from "@/constants/regex"

export const profileSchema = Type.Object({
  name: Type.RegExp(NAME_PATTERN),
  birthdate: Type.Optional(Type.RegExp(BIRTH_DATE_PATTERN)),
  email: Type.RegExp(EMAIL_PATTERN),
  username: Type.RegExp(USERNAME_PATTERN),
  image: Type.Optional(Type.String()),
})

export type ProfilePayload = FormPayload<typeof profileSchema>
export type ProfileFormValidationErrors = FormValidationErrors<keyof ProfilePayload>
