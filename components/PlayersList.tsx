"use client"

import { ReactNode, useMemo, useState } from "react"
import clsx from "clsx/lite"
import { BsSortAlphaDown, BsSortAlphaDownAlt, BsSortNumericDown, BsSortNumericDownAlt } from "react-icons/bs"
import { v4 as uuidv4 } from "uuid"
import PlayerInformation from "@/components/PlayerInformation"
import { PROVISIONAL_MAX_COMPLETED_GAMES } from "@/constants"
import { TowersGameUserWithUserAndTables } from "@/interfaces"

type PlayersListProps = {
  users: TowersGameUserWithUserAndTables[]
  full?: boolean
  onSelectedPlayer?: (userId: string) => void
}

export default function PlayersList({ users, full = false, onSelectedPlayer }: PlayersListProps): ReactNode {
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

    return users.slice().sort((a: TowersGameUserWithUserAndTables, b: TowersGameUserWithUserAndTables) => {
      if (sortKey === "name") {
        const nameA: string = a.user?.username || ""
        const nameB: string = b.user?.username || ""
        return sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
      } else if (sortKey === "rating") {
        const ratingA: number = a.rating || 0
        const ratingB: number = b.rating || 0
        return sortOrder === "asc" ? ratingA - ratingB : ratingB - ratingA
      } else {
        const tableNumberA: number = a.tables[0]?.tableNumber || 0
        const tableNumberB: number = b.tables[0]?.tableNumber || 0
        return sortOrder === "asc" ? tableNumberA - tableNumberB : tableNumberB - tableNumberA
      }
    })
  }, [users, sortKey, sortOrder])

  const handlePlayersRowClick = (index: string): void => {
    setSelectedPlayerId(index)
    onSelectedPlayer?.(index)
  }

  const handleOpenPlayerInfoModal = (): void => setIsPlayerInfoModalOpen(true)
  const handleClosePlayerInfoModal = (): void => setIsPlayerInfoModalOpen(false)

  return (
    <>
      <div className="flex flex-col h-fill border">
        {full && (
          <div className="flex border-b border-gray-200 divide-x-2 divide-gray-200 bg-gray-50">
            <div
              className="flex items-center gap-2 w-1/2 p-2"
              role="buton"
              tabIndex={0}
              onClick={() => handleSort("name")}
            >
              <span>Name</span>
              {sortKey === "name" && (sortOrder === "asc" ? <BsSortAlphaDown /> : <BsSortAlphaDownAlt />)}
            </div>
            <div
              className="flex items-center gap-2 w-1/4 p-2"
              role="buton"
              tabIndex={0}
              onClick={() => handleSort("rating")}
            >
              <span>Rating</span>
              {sortKey === "rating" && (sortOrder === "asc" ? <BsSortNumericDown /> : <BsSortNumericDownAlt />)}
            </div>
            <div
              className="flex items-center gap-2 w-1/4 p-2 me-4"
              role="buton"
              tabIndex={0}
              onClick={() => handleSort("table")}
            >
              <span>Table</span>
              {sortKey === "table" && (sortOrder === "asc" ? <BsSortNumericDown /> : <BsSortNumericDownAlt />)}
            </div>
          </div>
        )}
        <div className={clsx("overflow-y-scroll", full ? "flex-1 max-h-80" : "min-w-60 h-full px-2")}>
          {sortedPlayersList?.map((player: TowersGameUserWithUserAndTables) => (
            <div
              key={player.id}
              className={clsx(
                "flex",
                full ? "divide-x-2 divide-gray-200 select-none" : "divide-x divide-custom-neutral-100",
                selectedPlayerId === player.id ? "bg-blue-200" : "bg-white"
              )}
              role="button"
              tabIndex={0}
              onClick={() => handlePlayersRowClick(player.id)}
              onDoubleClick={handleOpenPlayerInfoModal}
            >
              <div className={clsx(full ? "w-1/2 p-2" : "w-3/4 p-1")}>
                <div className="flex items-center gap-1">
                  {full && (
                    <div
                      className={clsx(
                        "flex-shrink-0 w-4 h-4",
                        player.rating >= 2100 && "bg-red-400",
                        player.rating >= 1800 && player.rating <= 2099 && "bg-orange-400",
                        player.rating >= 1500 && player.rating <= 1799 && "bg-purple-400",
                        player.rating >= 1200 && player.rating <= 1499 && "bg-cyan-600",
                        player.rating <= 1199 && "bg-green-600",
                        player.gamesCompleted < PROVISIONAL_MAX_COMPLETED_GAMES && "!bg-gray-400"
                      )}
                    />
                  )}
                  <div className="truncate">{player.user.username}</div>
                </div>
              </div>
              <div className={clsx("w-1/4 text-end truncate", full ? "p-2" : "p-1")}>
                {player.gamesCompleted >= PROVISIONAL_MAX_COMPLETED_GAMES ? player.rating : "provisional"}
              </div>
              {full && <div className="w-1/4 p-2 text-end truncate">{player.tables[0].tableNumber}</div>}
            </div>
          ))}
        </div>
      </div>

      <PlayerInformation
        key={uuidv4()}
        isOpen={isPlayerInfoModalOpen}
        player={sortedPlayersList?.find((player: TowersGameUserWithUserAndTables) => player.id === selectedPlayerId)}
        onClose={handleClosePlayerInfoModal}
      />
    </>
  )
}
