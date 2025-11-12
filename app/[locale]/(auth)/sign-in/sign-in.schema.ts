import { Type } from "@sinclair/typebox";
import { EMAIL_PATTERN } from "@/constants/regex";

export const signInSchema = Type.Object({
  email: Type.RegExp(EMAIL_PATTERN),
  password: Type.String({ minLength: 1 }),
  rememberMe: Type.Boolean(),
});

export type SignInPayload = FormPayload<typeof signInSchema>
export type SignInFormValidationErrors = FormValidationErrors<keyof SignInPayload>
