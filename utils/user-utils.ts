import { USERNAME_PATTERN } from "@/constants"

export const generateRandomUsername = (base: string): string => {
  const maxBaseLength: number = 28 // Max length of base string to keep username within 32 characters after adding the suffix
  const truncatedBase: string = base.length > maxBaseLength ? base.substring(0, maxBaseLength) : base
  const randomSuffix: number = Math.floor(1000 + Math.random() * 9000)
  const candidateUsername: string = `${truncatedBase}${randomSuffix}`

  return USERNAME_PATTERN.test(candidateUsername) ? candidateUsername : generateRandomUsername(truncatedBase)
}
