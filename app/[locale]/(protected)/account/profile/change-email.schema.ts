import { Type } from "@sinclair/typebox";
import { EMAIL_PATTERN } from "@/constants/regex";

export const changeEmailSchema = Type.Object({
  email: Type.RegExp(EMAIL_PATTERN),
});

export type ChangeEmailPayload = FormPayload<typeof changeEmailSchema>;
export type ChangeEmailFormValidationErrors = FormValidationErrors<keyof ChangeEmailPayload>;
