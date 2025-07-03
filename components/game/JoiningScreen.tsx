"use client"

import { ReactNode, useEffect, useState } from "react"
import { useLingui } from "@lingui/react/macro"
import clsx from "clsx/lite"
import Button from "@/components/ui/Button"

interface JoiningScreenProps {
  title: string
  subtitle?: string
  isDone: boolean
  onCancel: () => void
}

export default function JoiningScreen({ title, subtitle, isDone, onCancel }: JoiningScreenProps): ReactNode {
  const { t } = useLingui()
  const [progress, setProgress] = useState<number>(0)
  const totalBlocks: number = 20
  const blocksToShow: number = Math.floor((progress / 100) * totalBlocks)

  useEffect(() => {
    const interval: NodeJS.Timeout = setInterval(() => {
      setProgress((prev: number) => {
        const target: number = isDone ? 100 : 95

        if (prev >= target) return prev

        const increment: number = prev < 80 ? Math.random() * 5 + 5 : Math.random() * 2
        return Math.min(prev + increment, target)
      })
    }, 200)

    return () => clearInterval(interval)
  }, [isDone])

  return (
    <div
      className={clsx(
        "absolute top-0 end-0 bottom-0 start-0 z-30 flex flex-col items-center justify-center gap-4 overflow-hidden w-full h-screen bg-black/10 cursor-wait",
      )}
      data-testid="joining-screen"
    >
      <div
        className={clsx(
          "relative flex flex-col p-4 border rounded-md shadow-2xl bg-white",
          "dark:border-dark-card-border dark:bg-dark-card-background",
        )}
      >
        <h1 className="mb-8 text-2xl text-center font-semibold">{title}</h1>
        <p className={clsx("text-start text-gray-700", "dark:text-dark-text")}>{subtitle}</p>
        <div className="flex items-center gap-2 mt-2">
          <div
            className={clsx(
              "flex gap-1 w-80 h-9 p-0.5 border-2 border-t-gray-600 border-e-gray-100 border-b-gray-100 border-s-gray-600 rounded-md bg-gray-200",
              "dark:border-t-dark-input-border-top dark:border-e-dark-input-border-end dark:border-b-dark-input-border-bottom dark:border-s-dark-input-border-start dark:bg-dark-input-background",
            )}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            data-testid="joining-screen_progress-bar"
          >
            {Array.from({ length: totalBlocks }).map((_, index: number) => {
              const isFilled: boolean = index < blocksToShow
              const isFirstFilled: boolean = index === 0 && isFilled
              const isLastFilled: boolean = index === blocksToShow - 1 && isFilled

              return (
                <div
                  key={index}
                  className={clsx(
                    "flex-1",
                    index < blocksToShow ? "bg-towers-primary" : "bg-transparent",
                    isFirstFilled && "rounded-s-sm",
                    isLastFilled && "rounded-e-sm",
                  )}
                  data-testid={
                    index < blocksToShow
                      ? `joining-screen_progress-bar_[${index}]_progress-filled`
                      : `joining-screen_progress-bar_[${index}]_progress-empty`
                  }
                />
              )
            })}
          </div>
          <Button dataTestId="joining-screen_cancel_button" onClick={onCancel}>
            {t({ message: "Cancel" })}
          </Button>
        </div>
      </div>
    </div>
  )
}
