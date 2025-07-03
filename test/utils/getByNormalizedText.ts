import { within } from "@testing-library/react"

export const getByNormalizedText = (textToMatch: string, container: HTMLElement = document.body): HTMLElement => {
  return within(container).getByText((_content: string, element: Element | null) => {
    const normalized: string | undefined = element?.textContent?.replace(/\s+/g, " ").trim() ?? ""
    return normalized?.includes(textToMatch)
  })
}

export const getAllByNormalizedText = (textToMatch: string, container: HTMLElement = document.body): HTMLElement[] => {
  return within(container).getAllByText((_content: string, element: Element | null) => {
    const normalized: string | undefined = element?.textContent?.replace(/\s+/g, " ").trim() ?? ""
    return normalized?.includes(textToMatch)
  })
}
