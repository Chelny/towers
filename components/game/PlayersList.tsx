"use client"

import { ReactNode, useMemo, useState } from "react"
import { TowersUser } from "@prisma/client"
import clsx from "clsx/lite"
import { BsSortAlphaDown, BsSortAlphaDownAlt, BsSortNumericDown, BsSortNumericDownAlt } from "react-icons/bs"
import { v4 as uuidv4 } from "uuid"
import PlayerInformation from "@/components/game/PlayerInformation"
import { PROVISIONAL_MAX_COMPLETED_GAMES } from "@/constants/game"
import { useSessionData } from "@/hooks/useSessionData"

type PlayersListProps = {
  users: TowersUser[]
  full?: boolean
  onSelectedPlayer?: (_userId: string) => void
}

export default function PlayersList({ users, full = false, onSelectedPlayer }: PlayersListProps): ReactNode {
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

    const uniqueUsersMap: Map<string, TowersUser> = new Map<string, TowersUser>()

    users.forEach((user: TowersUser) => {
      const key: string = `${user.room?.id}_${user.towersUserProfile?.id}`
      const existingUser: TowersUser | undefined = uniqueUsersMap.get(key)

      if (!existingUser || new Date(user.updatedAt) > new Date(existingUser.updatedAt)) {
        uniqueUsersMap.set(key, user)
      }
    })

    const uniqueUsers: TowersUser[] = Array.from(uniqueUsersMap.values())

    return uniqueUsers.slice().sort((a: TowersUser, b: TowersUser) => {
      const isProvisionalA: boolean = a.towersUserProfile?.gamesCompleted < PROVISIONAL_MAX_COMPLETED_GAMES
      const isProvisionalB: boolean = b.towersUserProfile?.gamesCompleted < PROVISIONAL_MAX_COMPLETED_GAMES

      if (sortKey === "name") {
        const nameA: string = a.towersUserProfile?.user?.username || ""
        const nameB: string = b.towersUserProfile?.user?.username || ""
        return sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
      } else if (sortKey === "rating") {
        // Add "provisional" first in ASC order
        if (isProvisionalA && !isProvisionalB) return sortOrder === "asc" ? -1 : 1
        if (!isProvisionalA && isProvisionalB) return sortOrder === "asc" ? 1 : -1

        const ratingA: number = a.towersUserProfile?.rating || 0
        const ratingB: number = b.towersUserProfile?.rating || 0
        return sortOrder === "asc" ? ratingA - ratingB : ratingB - ratingA
      } else {
        const tableNumberA: number = a.table?.tableNumber || 0
        const tableNumberB: number = b.table?.tableNumber || 0
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
      <div className="flex flex-col h-fill border bg-white">
        {full && (
          <div className="flex border-b border-gray-200 divide-x-2 divide-gray-200 bg-gray-50">
            <div
              className="flex items-center gap-2 w-1/2 p-2 cursor-pointer"
              role="buton"
              tabIndex={0}
              onClick={() => handleSort("name")}
            >
              <span>Name</span>
              {sortKey === "name" && (sortOrder === "asc" ? <BsSortAlphaDown /> : <BsSortAlphaDownAlt />)}
            </div>
            <div
              className="flex items-center gap-2 w-1/4 p-2 cursor-pointer"
              role="buton"
              tabIndex={0}
              onClick={() => handleSort("rating")}
            >
              <span>Rating</span>
              {sortKey === "rating" && (sortOrder === "asc" ? <BsSortNumericDown /> : <BsSortNumericDownAlt />)}
            </div>
            <div
              className="flex items-center gap-2 w-1/4 p-2 me-4 cursor-pointer"
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
          {sortedPlayersList?.map((player: TowersUser) => (
            <div
              key={player.id}
              className={clsx(
                "flex divide-gray-200",
                full ? "divide-x-2 select-none" : "divide-x",
                selectedPlayerId === player.id ? "bg-blue-100" : "bg-white",
                player.towersUserProfile.user.id === session?.user?.id && "text-blue-700"
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
                        player.towersUserProfile?.rating >= 2100 && "bg-red-400",
                        player.towersUserProfile?.rating >= 1800 &&
                          player.towersUserProfile?.rating <= 2099 &&
                          "bg-orange-400",
                        player.towersUserProfile?.rating >= 1500 &&
                          player.towersUserProfile?.rating <= 1799 &&
                          "bg-purple-400",
                        player.towersUserProfile?.rating >= 1200 &&
                          player.towersUserProfile?.rating <= 1499 &&
                          "bg-cyan-600",
                        player.towersUserProfile?.rating <= 1199 && "bg-green-600",
                        player.towersUserProfile?.gamesCompleted < PROVISIONAL_MAX_COMPLETED_GAMES && "!bg-gray-400"
                      )}
                    />
                  )}
                  <div className="truncate">{player.towersUserProfile?.user.username}</div>
                </div>
              </div>
              <div className={clsx("w-1/4 text-end truncate", full ? "p-2" : "p-1")}>
                {player.towersUserProfile?.gamesCompleted >= PROVISIONAL_MAX_COMPLETED_GAMES
                  ? player.towersUserProfile?.rating
                  : "provisional"}
              </div>
              {full && <div className="w-1/4 p-2 text-end truncate">{player.table?.tableNumber}</div>}
            </div>
          ))}
        </div>
      </div>

      <PlayerInformation
        key={uuidv4()}
        isOpen={isPlayerInfoModalOpen}
        player={sortedPlayersList?.find((player: TowersUser) => player.id === selectedPlayerId)}
        onCancel={handleClosePlayerInfoModal}
      />
    </>
  )
}
