import { useEffect, useRef } from "react"

export function useInterval(callback: () => void, delay: number | null): void {
  const callbackRef = useRef<() => void>(() => {})

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) return
    const interval: NodeJS.Timeout = setInterval(() => callbackRef.current(), delay)
    return () => clearInterval(interval)
  }, [delay])
}
