import { useCallback, useEffect, useRef, useState } from "react"

export const useOnScreen = <T extends HTMLElement>(
  options?: IntersectionObserverInit,
): [(node: T | null) => void, boolean] => {
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const observerRef = useRef<IntersectionObserver>(null)

  const setRef = useCallback(
    (node: T | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }

      if (!node) return

      const observer: IntersectionObserver = new IntersectionObserver(
        ([entry]: IntersectionObserverEntry[]) => {
          // Extra guard: require >50% AND element not `visibility:hidden`
          const element: HTMLElement = entry.target as HTMLElement
          const isCssVisible: boolean = element.offsetParent !== null && element.style.visibility !== "hidden"

          setIsVisible(entry.isIntersecting && entry.intersectionRatio >= 0.5 && isCssVisible)
        },
        { threshold: 0.5, ...options },
      )

      observer.observe(node)
      observerRef.current = observer
    },
    [options],
  )

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect()
    }
  }, [])

  return [setRef, isVisible]
}
