import { USERNAME_PATTERN } from "@/constants"

export function generateRandomUsername(base: string): string {
  const maxBaseLength: number = 28 // Max length of base string to keep username within 32 characters after adding the suffix
  const truncatedBase: string = base.length > maxBaseLength ? base.substring(0, maxBaseLength) : base
  const randomSuffix: number = Math.floor(1000 + Math.random() * 9000)
  const candidateUsername: string = `${truncatedBase}${randomSuffix}`

  return USERNAME_PATTERN.test(candidateUsername) ? candidateUsername : generateRandomUsername(truncatedBase)
}

export function removeNullUndefined<T extends object>(obj: T): NonNullableObject<T> {
  const result = {} as NonNullableObject<T>

  for (const key in obj) {
    if (obj[key] !== null && obj[key] !== undefined) {
      ;(result as any)[key] = obj[key]
    }
  }

  return result
}
