import { Type } from "@sinclair/typebox";
import { BIRTH_DATE_PATTERN, NAME_PATTERN, USERNAME_PATTERN } from "@/constants/regex";

export const profileSchema = Type.Object({
  name: Type.RegExp(NAME_PATTERN),
  birthdate: Type.Optional(Type.RegExp(BIRTH_DATE_PATTERN)),
  username: Type.RegExp(USERNAME_PATTERN),
});

export type PersonalInformationPayload = FormPayload<typeof profileSchema>;
export type PersonalInformationFormValidationErrors = FormValidationErrors<keyof PersonalInformationPayload>;
