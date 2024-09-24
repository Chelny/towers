import { Gender } from "@prisma/client"
import { Type } from "@sinclair/typebox"
import { BIRTH_DATE_PATTERN, EMAIL_PATTERN, NAME_PATTERN, USERNAME_PATTERN } from "@/constants/regex"

export const GenderType = Type.Union([Type.Literal(Gender.M), Type.Literal(Gender.F), Type.Literal(Gender.X)])

export const profileSchema = Type.Object({
  name: Type.RegExp(NAME_PATTERN),
  gender: Type.Optional(GenderType),
  birthdate: Type.Optional(Type.RegExp(BIRTH_DATE_PATTERN)),
  email: Type.RegExp(EMAIL_PATTERN),
  username: Type.RegExp(USERNAME_PATTERN),
  image: Type.Optional(Type.String())
})

export type ProfileFormData = SchemaFormData<typeof profileSchema>
export type ProfileFormErrorMessages = SchemaFormErrorMessages<keyof ProfileFormData>
