import { useCallback, useEffect, useState } from "react"
import { GameState } from "@/enums/towers"
import { TowersSeat, TowersTeam } from "@/interfaces/table"
import { authClient } from "@/lib/auth-client"

const INITIAL_TABLE_SEATS = [
  {
    rowSpan: 5,
    teamNumber: 1,
    seats: [
      { number: 1, user: undefined, isReady: false },
      { number: 2, user: undefined, isReady: false },
    ],
  },
  {
    rowSpan: 3,
    teamNumber: 3,
    seats: [
      { number: 5, user: undefined, isReady: false },
      { number: 6, user: undefined, isReady: false },
    ],
  },
  {
    rowSpan: 3,
    teamNumber: 2,
    seats: [
      { number: 3, user: undefined, isReady: false },
      { number: 4, user: undefined, isReady: false },
    ],
  },
  {
    rowSpan: 3,
    teamNumber: 4,
    seats: [
      { number: 7, user: undefined, isReady: false },
      { number: 8, user: undefined, isReady: false },
    ],
  },
]

export function useSeatAssignment() {
  const { data: session } = authClient.useSession()
  const [gameState, setGameState] = useState<GameState>(GameState.LOBBY)
  const [seatedSeats, setSeatedSeats] = useState<Set<number>>(new Set())
  const [seatsSwap, setSeatsSwap] = useState<TowersTeam[]>(INITIAL_TABLE_SEATS)
  const [gameStartCountdown, setGameStartCountdown] = useState<number | null>(null)

  const handleChooseSeat = useCallback(
    (seat: number | null): void => {
      setSeatedSeats((prevSeatedSeats: Set<number>) => {
        const newSeats: Set<number> = new Set<number>(prevSeatedSeats)

        if (seat === null) {
          newSeats.clear()
          setSeatsSwap(INITIAL_TABLE_SEATS)
        } else {
          if (newSeats.has(seat)) {
            newSeats.delete(seat)
          } else {
            newSeats.add(seat)
          }
        }

        return newSeats
      })

      setSeatsSwap((prevSeatsSwap: TowersTeam[]) => {
        if (seat === null) return prevSeatsSwap

        // Skip swapping logic for seats 1 and 2
        if (seat === 1 || seat === 2) {
          return prevSeatsSwap.map((group: TowersTeam) => ({
            ...group,
            seats: group.seats.map((seatObj: TowersSeat) => ({
              ...seatObj,
              user: seatObj.number === seat ? (session?.user ?? null) : seatObj.user,
            })),
          }))
        }

        // Find the clicked team group
        const clickedTeamGroup: TowersTeam | undefined = prevSeatsSwap.find((group: TowersTeam) =>
          group.seats.some((seatObj: TowersSeat) => seatObj.number === seat),
        )
        if (!clickedTeamGroup) return prevSeatsSwap

        const clickedTeamSeats: TowersSeat[] = clickedTeamGroup.seats
        const clickedTeam: number = clickedTeamGroup.teamNumber

        // Find other teams
        const otherTeamsGroups: TowersTeam[] = prevSeatsSwap.filter(
          (group: TowersTeam) => group.teamNumber !== clickedTeam,
        )
        if (otherTeamsGroups.length === 0) return prevSeatsSwap

        // Select the first group to swap with
        const teamToSwapWithGroup: TowersTeam = otherTeamsGroups[0]
        const teamToSwapWithSeats: TowersSeat[] = teamToSwapWithGroup.seats

        // Swap seat assignments between the two teams
        const newSeatsMapping: Record<number, number> = {}
        clickedTeamSeats.forEach((seatObj: TowersSeat, index: number) => {
          newSeatsMapping[seatObj.number] = teamToSwapWithSeats[index % teamToSwapWithSeats.length].number
        })

        teamToSwapWithSeats.forEach((seatObj: TowersSeat, index: number) => {
          newSeatsMapping[seatObj.number] = clickedTeamSeats[index % clickedTeamSeats.length].number
        })

        return prevSeatsSwap.map((group: TowersTeam) => ({
          ...group,
          seats: group.seats.map((seatObj: TowersSeat) => {
            const newSeatNumber: number = newSeatsMapping[seatObj.number] || seatObj.number
            return {
              ...seatObj,
              number: newSeatNumber,
              user: newSeatNumber === seat ? (session?.user ?? undefined) : seatObj.user,
            }
          }),
        }))
      })
    },
    [session],
  )

  const handleReady = useCallback((seatNumber: number): void => {
    setSeatsSwap((prevSeats) =>
      prevSeats.map((team) => ({
        ...team,
        seats: team.seats.map((seat) => ({
          ...seat,
          isReady: seat.number === seatNumber ? !seat.isReady : seat.isReady,
        })),
      })),
    )
  }, [])

  useEffect(() => {
    if (gameState !== GameState.LOBBY) return

    const allReady = seatsSwap
      .flatMap((team) => team.seats)
      .filter((seat) => seat.user)
      .every((seat) => seat.isReady)

    if (allReady && seatsSwap.flatMap((team) => team.seats).some((seat) => seat.user)) {
      setGameStartCountdown(15) // Start gameStartCountdown if all players are ready
    }
  }, [seatsSwap])

  useEffect(() => {
    if (gameStartCountdown === null) return

    if (gameStartCountdown > 0) {
      const timer: NodeJS.Timeout = setTimeout(() => setGameStartCountdown(gameStartCountdown - 1), 1000)
      console.log("gameStartCountdown", gameStartCountdown)
      return () => clearTimeout(timer)
    }

    // Countdown reaches 0, start the game
    if (gameStartCountdown === 0) {
      console.log("Game starts now!")
      setGameState(GameState.STARTED)
    }
  }, [gameStartCountdown])

  return { seatedSeats, seatsSwap, gameState, gameStartCountdown, handleChooseSeat, handleReady }
}
