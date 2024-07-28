export function removeNullUndefined<T extends object>(obj: T): NonNullableObject<T> {
  const result = {} as NonNullableObject<T>

  for (const key in obj) {
    if (obj[key] !== null && obj[key] !== undefined) {
      ;(result as any)[key] = obj[key]
    }
  }

  return result
}
