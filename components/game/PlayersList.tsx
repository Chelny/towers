"use client"

import { ReactNode, useMemo, useState } from "react"
import { ITowersUserRoomTable } from "@prisma/client"
import clsx from "clsx/lite"
import { BsSortAlphaDown, BsSortAlphaDownAlt, BsSortNumericDown, BsSortNumericDownAlt } from "react-icons/bs"
import { v4 as uuidv4 } from "uuid"
import PlayerInformation from "@/components/game/PlayerInformation"
import {
  PROVISIONAL_MAX_COMPLETED_GAMES,
  RATING_DIAMOND,
  RATING_GOLD,
  RATING_MASTER,
  RATING_PLATINUM
} from "@/constants/game"
import { useSessionData } from "@/hooks/useSessionData"

type PlayersListProps = {
  users: ITowersUserRoomTable[]
  full?: boolean
  isRatingsVisible?: boolean | null
  onSelectedPlayer?: (userId: string) => void
}

export default function PlayersList({
  users,
  full = false,
  isRatingsVisible = false,
  onSelectedPlayer
}: PlayersListProps): ReactNode {
  const { data: session } = useSessionData()
  const [sortKey, setSortKey] = useState<"name" | "rating" | "table">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const [isPlayerInfoModalOpen, setIsPlayerInfoModalOpen] = useState<boolean>(false)

  const handleSort = (key: "name" | "rating" | "table"): void => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortOrder("asc")
    }
  }

  const sortedPlayersList = useMemo(() => {
    if (!users) return []

    return users.slice().sort((a: ITowersUserRoomTable, b: ITowersUserRoomTable) => {
      switch (sortKey) {
        case "name":
          const nameA: string = a.userProfile?.user?.username || ""
          const nameB: string = b.userProfile?.user?.username || ""

          return sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
        case "rating":
          if (!isRatingsVisible) break

          const isProvisionalA: boolean = a.userProfile?.gamesCompleted < PROVISIONAL_MAX_COMPLETED_GAMES
          const isProvisionalB: boolean = b.userProfile?.gamesCompleted < PROVISIONAL_MAX_COMPLETED_GAMES

          // Add "provisional" first in ASC order
          if (isProvisionalA && !isProvisionalB) return sortOrder === "asc" ? -1 : 1
          if (!isProvisionalA && isProvisionalB) return sortOrder === "asc" ? 1 : -1

          const ratingA: number = a.userProfile?.rating || 0
          const ratingB: number = b.userProfile?.rating || 0

          return sortOrder === "asc" ? ratingA - ratingB : ratingB - ratingA
        case "table":
          const tableNumberA: number = a.table?.tableNumber || 0
          const tableNumberB: number = b.table?.tableNumber || 0

          return sortOrder === "asc" ? tableNumberA - tableNumberB : tableNumberB - tableNumberA
        default:
          break
      }

      return 0
    })
  }, [users, sortKey, sortOrder])

  const handlePlayersRowClick = (playerId: string): void => {
    setSelectedPlayerId(playerId)
    onSelectedPlayer?.(playerId)
  }

  const handleOpenPlayerInfoModal = (): void => setIsPlayerInfoModalOpen(true)
  const handleClosePlayerInfoModal = (): void => setIsPlayerInfoModalOpen(false)

  return (
    <>
      <div className="flex flex-col h-fill border bg-white">
        {full && (
          <div className="flex border-b border-gray-200 divide-x-2 divide-gray-200 bg-gray-50">
            <div
              className={clsx("flex items-center gap-2 p-2 cursor-pointer", isRatingsVisible ? "w-6/12" : "w-9/12")}
              role="buton"
              tabIndex={0}
              onClick={() => handleSort("name")}
            >
              <span>Name</span>
              {sortKey === "name" && (sortOrder === "asc" ? <BsSortAlphaDown /> : <BsSortAlphaDownAlt />)}
            </div>
            {isRatingsVisible && (
              <div
                className="flex items-center gap-2 w-3/12 p-2 cursor-pointer"
                role="buton"
                tabIndex={0}
                onClick={() => handleSort("rating")}
              >
                <span>Rating</span>
                {sortKey === "rating" && (sortOrder === "asc" ? <BsSortNumericDown /> : <BsSortNumericDownAlt />)}
              </div>
            )}
            <div
              className="flex items-center gap-2 w-3/12 p-2 me-4 cursor-pointer"
              role="buton"
              tabIndex={0}
              onClick={() => handleSort("table")}
            >
              <span>Table</span>
              {sortKey === "table" && (sortOrder === "asc" ? <BsSortNumericDown /> : <BsSortNumericDownAlt />)}
            </div>
          </div>
        )}
        <div className={clsx("overflow-y-scroll", full ? "flex-1 max-h-80" : "min-w-60 h-full")}>
          {sortedPlayersList?.map((player: ITowersUserRoomTable) => (
            <div
              key={player.id}
              className={clsx(
                "flex divide-gray-200",
                full ? "divide-x-2 select-none" : "divide-x",
                selectedPlayerId === player.id ? "bg-blue-100" : "bg-white",
                player.userProfile?.userId === session?.user.id && "text-blue-700"
              )}
              role="button"
              tabIndex={0}
              onClick={() => handlePlayersRowClick(player.id)}
              onDoubleClick={handleOpenPlayerInfoModal}
            >
              <div className={clsx("p-2 truncate", full && isRatingsVisible ? "w-6/12" : "w-9/12")}>
                <div className="flex items-center gap-1">
                  {full && isRatingsVisible && (
                    <div
                      className={clsx(
                        "flex-shrink-0 w-4 h-4",
                        player.userProfile?.rating >= RATING_MASTER && "bg-red-400",
                        player.userProfile?.rating >= RATING_DIAMOND &&
                          player.userProfile?.rating < RATING_MASTER &&
                          "bg-orange-400",
                        player.userProfile?.rating >= RATING_PLATINUM &&
                          player.userProfile?.rating < RATING_DIAMOND &&
                          "bg-purple-400",
                        player.userProfile?.rating >= RATING_GOLD &&
                          player.userProfile?.rating < RATING_PLATINUM &&
                          "bg-cyan-600",
                        player.userProfile?.rating < RATING_GOLD && "bg-green-600",
                        player.userProfile?.gamesCompleted < PROVISIONAL_MAX_COMPLETED_GAMES && "!bg-gray-400"
                      )}
                    />
                  )}
                  <div className="truncate">{player.userProfile?.user?.username}</div>
                </div>
              </div>
              {isRatingsVisible && (
                <div className={clsx("p-2 text-end truncate", full ? "w-3/12" : "w-5/12")}>
                  {player.userProfile?.gamesCompleted >= PROVISIONAL_MAX_COMPLETED_GAMES
                    ? player.userProfile?.rating
                    : "provisional"}
                </div>
              )}
              {full && (
                <div className={clsx("p-2 text-end truncate", isRatingsVisible ? "w-3/12" : "w-3/12")}>
                  {player.table?.tableNumber}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <PlayerInformation
        key={uuidv4()}
        isOpen={isPlayerInfoModalOpen}
        player={sortedPlayersList?.find((player: ITowersUserRoomTable) => player.id === selectedPlayerId)}
        isRatingsVisible={isRatingsVisible}
        onCancel={handleClosePlayerInfoModal}
      />
    </>
  )
}
