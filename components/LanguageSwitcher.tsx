"use client"

import { ReactNode } from "react"
import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useLingui } from "@lingui/react/macro"
import Select from "@/components/ui/Select"
import { Language, languages, SupportedLocales } from "@/translations/languages"

export default function LanguageSwitcher(): ReactNode {
  const router = useRouter()
  const pathname: string = usePathname()
  const { i18n } = useLingui()
  const [locale, setLocale] = useState<SupportedLocales>(pathname?.split("/")[1] as SupportedLocales)

  const handleChange = (locale: string): void => {
    const pathNameWithoutLocale: string[] = pathname?.split("/")?.slice(2) ?? []
    const newPath: string = `/${locale}/${pathNameWithoutLocale.join("/")}`

    // @ts-ignore
    setLocale(locale)
    router.push(newPath)
  }

  return (
    <Select
      className="-mb-4"
      id="language-switcher"
      defaultValue={locale}
      // @ts-ignore
      value={locale}
      dataTestId="language-switcher-select"
      onChange={handleChange}
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
  )
}
