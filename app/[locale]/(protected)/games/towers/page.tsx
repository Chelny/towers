import { ReactNode } from "react"
import type { Metadata } from "next"
import dynamic from "next/dynamic"
import { I18n } from "@lingui/core"
import { initLingui } from "@/app/init-lingui"
import TowersPageContent from "@/components/game/TowersPageContent"
import RoomsListSkeleton from "@/components/skeleton/RoomsListSkeleton"
import { ROUTE_TOWERS } from "@/constants/routes"

const RoomsList = dynamic(() => import("@/components/game/RoomsList"), {
  loading: () => <RoomsListSkeleton />,
})

type TowersProps = {
  params: Promise<Params>
  searchParams: Promise<SearchParams>
}

export async function generateMetadata({ params, searchParams }: TowersProps): Promise<Metadata> {
  const routeParams: Params = await params
  const routeSearchParams: SearchParams = await searchParams
  const i18n: I18n = initLingui(routeParams.locale)
  let title: string = i18n._(ROUTE_TOWERS.TITLE)

  // TODO: To remove?
  // if (routeSearchParams.room) {
  //   const room: TowersRoom | null = await prisma.towersRoom.findUnique({
  //     where: { id: routeSearchParams.room as string },
  //   })

  //   const roomName: string | undefined = room?.name
  //   title = t({ message: `Room: ${roomName}` })

  //   if (routeSearchParams.table) {
  //     const table: TowersTable | null = await prisma.towersTable.findUnique({
  //       where: { id: routeSearchParams.table as string },
  //     })

  //     if (table) {
  //       const tableHost: ITowersUserProfile | null = await prisma.towersUserProfile.findUnique({
  //         where: { userId: table?.hostId },
  //         include: { user: true },
  //       })

  //       if (tableHost) {
  //         const tableNumber: number = table.tableNumber
  //         const tableHostUsername: string | undefined = tableHost.user.username
  //         title += ` - ${t({ message: `Table: ${tableNumber} - Host: ${tableHostUsername}` })}`
  //       }
  //     }
  //   }
  // }

  return {
    title,
    alternates: {
      canonical: `${process.env.BASE_URL}${ROUTE_TOWERS.PATH}`,
    },
  }
}

export default async function Towers({ params, searchParams }: TowersProps): Promise<ReactNode> {
  const routeParams: Params = await params
  const routeSearchParams: SearchParams = await searchParams
  const i18n: I18n = initLingui(routeParams.locale)
  const roomId: string = routeSearchParams.room as string
  const tableId: string = routeSearchParams.table as string

  if (!roomId && !tableId) {
    return (
      <>
        <h1 className="mb-8 text-3xl">{i18n._(ROUTE_TOWERS.TITLE)}</h1>
        <RoomsList />
      </>
    )
  }

  return <TowersPageContent />
}
