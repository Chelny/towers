export const debounce = (func: Function, wait: number): Debounce => {
  let timeout: NodeJS.Timeout

  return function (this: any, ...args: any[]): void {
    const later = (): void => {
      clearTimeout(timeout)
      func.apply(this, args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const removeNullUndefined = <T extends object>(obj: T): NonNullableObject<T> => {
  const result: NonNullableObject<T> = {} as NonNullableObject<T>

  for (const key in obj) {
    if (obj[key] !== null && obj[key] !== undefined) {
      ;(result as any)[key] = obj[key]
    }
  }

  return result
}
