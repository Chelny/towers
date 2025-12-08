import { Type } from "@sinclair/typebox";

export const addPasskeySchema = Type.Object({
  name: Type.String({ pattern: "^[a-zA-Z0-9\\s._-]{3,50}$" }),
});

export type AddPasskeyPayload = FormPayload<typeof addPasskeySchema>;
export type AddPasskeyFormValidationErrors = FormValidationErrors<keyof AddPasskeyPayload>;
