export const removeNullUndefined = <T extends object>(obj: T): NonNullableObject<T> => {
  const result: NonNullableObject<T> = {} as NonNullableObject<T>

  for (const key in obj) {
    if (obj[key] !== null && obj[key] !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(result as any)[key] = obj[key]
    }
  }

  return result
}
