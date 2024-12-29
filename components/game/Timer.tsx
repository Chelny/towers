import { ReactNode, useEffect, useState } from "react"

interface TimerProps {
  isActive: boolean
}

export default function Timer({ isActive }: TimerProps): ReactNode {
  const [timeElapsed, setTimeElapsed] = useState<number | null>(null)

  const formatTime = (timeInSeconds: number | null): string => {
    if (timeInSeconds === null) return "--:--"

    const minutes: number = Math.floor(timeInSeconds / 60)
    const seconds: number = timeInSeconds % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null

    if (isActive) {
      setTimeElapsed(0)

      timerId = setInterval(() => {
        setTimeElapsed((prevTime: number | null) => (prevTime ?? 0) + 1)
      }, 1000)
    } else {
      if (timerId) clearInterval(timerId)
    }

    return () => {
      if (timerId) clearInterval(timerId)
    }
  }, [isActive])

  return (
    <div className="w-full border-double border-8 border-neutral-300 font-mono text-gray-400 text-4xl text-center tabular-nums">
      {formatTime(timeElapsed)}
    </div>
  )
}
