"use client"

import { ReactNode, useMemo, useState } from "react"
import { Trans, useLingui } from "@lingui/react/macro"
import { createId } from "@paralleldrive/cuid2"
import { ITowersUserProfileWithRelations } from "@prisma/client"
import clsx from "clsx/lite"
import { BsSortAlphaDown, BsSortAlphaDownAlt, BsSortNumericDown, BsSortNumericDownAlt } from "react-icons/bs"
import PlayerInformation from "@/components/game/PlayerInformation"
import {
  PROVISIONAL_MAX_COMPLETED_GAMES,
  RATING_DIAMOND,
  RATING_GOLD,
  RATING_MASTER,
  RATING_PLATINUM,
} from "@/constants/game"
import { authClient } from "@/lib/auth-client"

type PlayersListProps = {
  users: ITowersUserProfileWithRelations[]
  isRatingsVisible?: boolean | null
  isTableNumberVisible?: boolean
  onSelectedPlayer?: (userId: string) => void
}

export default function PlayersList({
  users,
  isRatingsVisible = false,
  isTableNumberVisible = false,
  onSelectedPlayer,
}: PlayersListProps): ReactNode {
  const { data: session } = authClient.useSession()
  const [sortKey, setSortKey] = useState<"name" | "rating" | "table">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const [isPlayerInfoModalOpen, setIsPlayerInfoModalOpen] = useState<boolean>(false)
  const { t } = useLingui()

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

    return users.slice().sort((a: ITowersUserProfileWithRelations, b: ITowersUserProfileWithRelations) => {
      switch (sortKey) {
        case "name":
          const nameA: string = a.user?.username || ""
          const nameB: string = b.user?.username || ""

          return sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
        case "rating":
          if (!isRatingsVisible) break

          const isProvisionalA: boolean = a.gamesCompleted < PROVISIONAL_MAX_COMPLETED_GAMES
          const isProvisionalB: boolean = b.gamesCompleted < PROVISIONAL_MAX_COMPLETED_GAMES

          // Add "provisional" first in ASC order
          if (isProvisionalA && !isProvisionalB) return sortOrder === "asc" ? -1 : 1
          if (!isProvisionalA && isProvisionalB) return sortOrder === "asc" ? 1 : -1

          const ratingA: number = a.rating || 0
          const ratingB: number = b.rating || 0

          return sortOrder === "asc" ? ratingA - ratingB : ratingB - ratingA
        case "table":
          const tableNumberA: number = (a.userTables && a.userTables[a.userTables?.length - 1]?.table?.tableNumber) || 0
          const tableNumberB: number = (b.userTables && b.userTables[b.userTables?.length - 1]?.table?.tableNumber) || 0

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
      <div className="grid grid-rows-[auto,1fr] h-full border bg-white">
        {/* Players List Heading */}
        <div
          className={clsx(
            "grid gap-1 pe-3 border-b border-gray-200 divide-x-2 divide-gray-200 bg-gray-50",
            isRatingsVisible && isTableNumberVisible ? "grid-cols-[5fr,4fr,3fr]" : "grid-cols-[8fr,4fr]",
          )}
        >
          <div
            className="flex items-center gap-2 p-2 cursor-pointer"
            role="buton"
            tabIndex={0}
            onClick={() => handleSort("name")}
          >
            <span>
              <Trans>Name</Trans>
            </span>
            {sortKey === "name" &&
              (sortOrder === "asc" ? (
                <BsSortAlphaDown aria-label={t({ message: "Sort ascending" })} />
              ) : (
                <BsSortAlphaDownAlt aria-label={t({ message: "Sort descending" })} />
              ))}
          </div>
          {isRatingsVisible && (
            <div
              className="flex items-center gap-2 p-2 cursor-pointer"
              role="buton"
              tabIndex={0}
              onClick={() => handleSort("rating")}
            >
              <span>
                <Trans>Rating</Trans>
              </span>
              {sortKey === "rating" &&
                (sortOrder === "asc" ? (
                  <BsSortNumericDown aria-label={t({ message: "Sort ascending" })} />
                ) : (
                  <BsSortNumericDownAlt aria-label={t({ message: "Sort descending" })} />
                ))}
            </div>
          )}
          {isTableNumberVisible && (
            <div
              className="flex items-center gap-2 p-2 cursor-pointer"
              role="buton"
              tabIndex={0}
              onClick={() => handleSort("table")}
            >
              <span>
                <Trans>Table</Trans>
              </span>
              {sortKey === "table" &&
                (sortOrder === "asc" ? (
                  <BsSortNumericDown aria-label={t({ message: "Sort ascending" })} />
                ) : (
                  <BsSortNumericDownAlt aria-label={t({ message: "Sort descending" })} />
                ))}
            </div>
          )}
        </div>
        {/* Players List */}
        <div className="overflow-y-scroll">
          {sortedPlayersList?.map((player: ITowersUserProfileWithRelations) => (
            <div
              key={player.id}
              className={clsx(
                "grid gap-1 divide-x-2 divide-gray-200 even:bg-gray-50",
                isRatingsVisible && isTableNumberVisible ? "grid-cols-[5fr,4fr,3fr]" : "grid-cols-[8fr,4fr]",
                selectedPlayerId === player.id && "!bg-blue-100",
                player.userId === session?.user.id && "text-blue-700",
              )}
              role="button"
              tabIndex={0}
              onClick={() => handlePlayersRowClick(player.id)}
              onDoubleClick={handleOpenPlayerInfoModal}
            >
              <div className="p-2 truncate">
                <div className="flex items-center gap-1">
                  {isRatingsVisible && (
                    <div
                      className={clsx(
                        "flex-shrink-0 w-4 h-4",
                        player.rating >= RATING_MASTER && "bg-red-400",
                        player.rating >= RATING_DIAMOND && player.rating < RATING_MASTER && "bg-orange-400",
                        player.rating >= RATING_PLATINUM && player.rating < RATING_DIAMOND && "bg-purple-400",
                        player.rating >= RATING_GOLD && player.rating < RATING_PLATINUM && "bg-cyan-600",
                        player.rating < RATING_GOLD && "bg-green-600",
                        player.gamesCompleted < PROVISIONAL_MAX_COMPLETED_GAMES && "!bg-gray-400",
                      )}
                    />
                  )}
                  <div className="truncate">{player.user?.username}</div>
                </div>
              </div>
              {isRatingsVisible && (
                <div className="p-2 text-end truncate">
                  {player.gamesCompleted >= PROVISIONAL_MAX_COMPLETED_GAMES ? player.rating : "provisional"}
                </div>
              )}
              {isTableNumberVisible && (
                <div className="p-2 text-end truncate">
                  {player.userTables && player.userTables[player.userTables?.length - 1]?.table?.tableNumber}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <PlayerInformation
        key={createId()}
        isOpen={isPlayerInfoModalOpen}
        player={sortedPlayersList?.find((player: ITowersUserProfileWithRelations) => player.id === selectedPlayerId)}
        isRatingsVisible={isRatingsVisible}
        onCancel={handleClosePlayerInfoModal}
      />
    </>
  )
}
