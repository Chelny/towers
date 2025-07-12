import { ReactNode } from "react"
import clsx from "clsx/lite"

export default function RoomTableSkeleton(): ReactNode {
  const seatMapping: number[][] = [
    [1, 3, 5, 7],
    [2, 4, 6, 8],
  ]

  return (
    <div className="animate-pulse">
      {Array.from({ length: 10 }).map((_, index: number) => (
        <div key={index} className="flex flex-col mb-4">
          <div className="flex items-center">
            <div className="basis-20 row-span-2 flex justify-center items-center h-full px-2">
              <div className={clsx("w-8 h-4 rounded-sm bg-gray-200", "dark:bg-dark-skeleton-content-background")} />
            </div>
            <div className="flex-1 flex flex-col gap-1 h-full px-2 divide-y divide-gray-200">
              <div className="flex flex-1 gap-1 pt-3 pb-2">
                <div className="basis-32">
                  <div
                    className={clsx(
                      "w-full h-[68px] rounded-sm bg-gray-200",
                      "dark:bg-dark-skeleton-content-background",
                    )}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  {seatMapping.map((row: number[], rowIndex: number) => (
                    <div key={rowIndex} className="flex flex-row gap-1">
                      {row.map((_, colIndex: number) => (
                        <div
                          key={colIndex}
                          className={clsx(
                            "w-36 h-8 p-1 rounded-sm bg-gray-200",
                            "dark:bg-dark-skeleton-content-background",
                          )}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                <div className="flex-1 px-2">
                  <div
                    className={clsx("w-full h-4 rounded-sm bg-gray-200", "dark:bg-dark-skeleton-content-background")}
                  />
                </div>
              </div>
              <div className="flex py-1 text-sm">
                <div className={clsx("w-16 h-4 me-2 rounded-sm bg-gray-200")} />
                <div className={clsx("w-24 h-4 rounded-sm bg-gray-200")} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
