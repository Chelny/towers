import { I18n, type MessageDescriptor } from "@lingui/core";
import { keyboardKeyLabels } from "@/lib/keyboard/keyboard-key-labels";

export function getReadableKeyLabel(i18n: I18n, code?: string): string {
  if (!code) return "";

  const label: string | MessageDescriptor = keyboardKeyLabels[code];

  if (typeof label === "object" && "id" in label) {
    return i18n._(label);
  }

  return label ?? code;
}
