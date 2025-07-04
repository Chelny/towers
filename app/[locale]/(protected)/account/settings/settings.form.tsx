"use client"

import { FormEvent, ReactNode, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Trans, useLingui } from "@lingui/react/macro"
import { WebsiteTheme } from "@prisma/client"
import { Value, ValueError } from "@sinclair/typebox/value"
import clsx from "clsx/lite"
import { useTheme } from "next-themes"
import {
  SettingsFormValidationErrors,
  SettingsPayload,
  settingsSchema,
} from "@/app/[locale]/(protected)/account/settings/settings.schema"
import AlertMessage from "@/components/ui/AlertMessage"
import Button from "@/components/ui/Button"
import Select from "@/components/ui/Select"
import { INITIAL_FORM_STATE } from "@/constants/api"
import { Session } from "@/lib/auth-client"
import { logger } from "@/lib/logger"
import { defaultLocale, Language, languages, SupportedLocales } from "@/translations/languages"

type SettingsFormProps = {
  session: Session | null
}

export function SettingsForm({ session }: SettingsFormProps): ReactNode {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [formState, setFormState] = useState<ApiResponse>(INITIAL_FORM_STATE)
  const { i18n, t } = useLingui()
  const router = useRouter()
  const pathname: string = usePathname()
  const { setTheme } = useTheme()

  const handleUpdateUser = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()

    const formData: FormData = new FormData(event.currentTarget)
    const payload: SettingsPayload = {
      language: formData.get("language") as SupportedLocales,
      theme: formData.get("theme") as WebsiteTheme,
    }

    const errors: ValueError[] = Array.from(Value.Errors(settingsSchema, payload))
    const errorMessages: SettingsFormValidationErrors = {}

    for (const error of errors) {
      switch (error.path.replace("/", "")) {
        case "language":
          errorMessages.language = t({ message: "The language is invalid." })
          break
        case "theme":
          errorMessages.theme = t({ message: "The theme is invalid." })
          break
        default:
          logger.warn(`Settings Validation: Unknown error at ${error.path}`)
          break
      }
    }

    if (Object.keys(errorMessages).length > 0) {
      setFormState({
        success: false,
        message: t({ message: "Validation errors occurred." }),
        error: errorMessages,
      })
    } else {
      setIsLoading(true)

      await fetch("/api/account/settings", {
        method: "POST",
        body: JSON.stringify({
          language: payload.language,
          theme: payload.theme,
        }),
      })
        .then(async (response) => {
          const data: ApiResponse = await response.json()
          setIsLoading(false)
          setFormState(data)

          // Set theme dynamically
          setTheme(payload.theme.toLowerCase())

          // Dynamically change language
          const pathNameWithoutLocale: string[] = pathname?.split("/")?.slice(2) ?? []
          const newPath: string = `/${payload.language}/${pathNameWithoutLocale.join("/")}`

          setTimeout(() => {
            router.push(newPath)
          }, 2000)
        })
        .catch(async (error) => {
          const data: ApiResponse = await error.json()
          setIsLoading(false)
          setFormState(data)
        })
    }
  }

  return (
    <div
      className={clsx(
        "max-w-full p-4 border border-gray-200 rounded-lg shadow-xs bg-gray-50",
        "md:max-w-96",
        "dark:border-dark-card-border dark:bg-dark-card-background",
      )}
    >
      <form className="w-full" noValidate onSubmit={handleUpdateUser}>
        {formState?.message && (
          <AlertMessage type={formState.success ? "success" : "error"}>{formState.message}</AlertMessage>
        )}
        <Select
          id="language"
          label={t({ message: "Language" })}
          defaultValue={session?.user.language ?? defaultLocale}
          required
          dataTestId="settings_select_language"
        >
          {languages.map((language: Language) => (
            <Select.Option key={language.locale} value={language.locale}>
              <div className="flex gap-2">
                <div>{language.flag}</div>
                <div>{i18n._(language.msg)}</div>
              </div>
            </Select.Option>
          ))}
        </Select>
        <Select
          id="theme"
          label={t({ message: "Theme" })}
          defaultValue={session?.user.theme ?? WebsiteTheme.SYSTEM}
          required
          dataTestId="settings_select_theme"
        >
          {Object.values(WebsiteTheme).map((theme: WebsiteTheme) => (
            <Select.Option key={theme} value={theme}>
              {theme === "LIGHT"
                ? t({ message: "Light" })
                : theme === "DARK"
                  ? t({ message: "Dark" })
                  : t({ message: "System" })}
            </Select.Option>
          ))}
        </Select>
        <Button type="submit" className="w-full" disabled={isLoading}>
          <Trans>Update Settings</Trans>
        </Button>
      </form>
    </div>
  )
}
