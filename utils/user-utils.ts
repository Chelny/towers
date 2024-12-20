import { USERNAME_PATTERN } from "@/constants/regex"

const sanitizeBase = (base: string): string => {
  return base.replace(/^[_\.]+|[_\.]+$/g, "") // Remove leading/trailing `_` or `.`
}

export const generateRandomUsername = (base: string): string => {
  const sanitizedBase: string = sanitizeBase(base) // Ensure base respects username rules
  const maxBaseLength: number = 28 // Max length of base string to keep username within 32 characters after adding the suffix
  const truncatedBase: string =
    sanitizedBase.length > maxBaseLength ? sanitizedBase.substring(0, maxBaseLength) : sanitizedBase
  const randomSuffix: number = Math.floor(1000 + Math.random() * 9000)
  const candidateUsername: string = `${truncatedBase}${randomSuffix}`

  return USERNAME_PATTERN.test(candidateUsername) ? candidateUsername : generateRandomUsername(truncatedBase)
}
