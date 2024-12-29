vi.mock("@lingui/core/macro", () => ({
  msg: (str: TemplateStringsArray | string) => str,
  plural: (count: number, forms: { zero?: string; one?: string; other: string }) => {
    if (count === 0 && forms.zero) return forms.zero.replace("#", count.toString())
    if (count === 1 && forms.one) return forms.one.replace("#", count.toString())
    return forms.other.replace("#", count.toString())
  },
  t: (key: Record<string, string>) => key.message,
}))

vi.mock("@lingui/react/macro", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Trans: ({ id, values, children }: { id?: string; values?: Record<string, any>; children?: React.ReactNode }) => {
    if (typeof children === "string") return <>{children}</>
    if (Array.isArray(children)) return <>{children}</>
    return children
  },
  useLingui: vi.fn().mockReturnValue({
    i18n: { _: (str: string) => str },
    t: (key: Record<string, string>) => key.message,
  }),
}))
