import { Type } from "@sinclair/typebox";
import { Language, languages } from "@/translations/languages";

export const settingsSchema = Type.Object({
  language: Type.Union(languages.map((language: Language) => Type.Literal(language.locale))),
});

export type SettingsPayload = FormPayload<typeof settingsSchema>;
export type SettingsFormValidationErrors = FormValidationErrors<keyof SettingsPayload>;
