import { ReactNode } from "react"

export default function RoomsLoading(): ReactNode {
  // You can add any UI inside Loading, including a Skeleton.
  // return <LoadingSkeleton />
  return <div className="p-4">Loading rooms...</div>
}
