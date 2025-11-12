"use client";

import { ReactNode } from "react";
import clsx from "clsx/lite";
import { TowersRoomWithRelations } from "db";
import Banner from "@/components/Banner";

type RoomHeaderProps = {
  room?: TowersRoomWithRelations
}

export default function RoomHeader({ room }: RoomHeaderProps): ReactNode {
  return (
    <div className="[grid-area:banner]">
      <div className="flex justify-between items-center gap-6">
        <h1 className="w-1/3 p-4 text-4xl">{room?.name}</h1>
        <Banner />
      </div>

      <div className={clsx("px-4 py-1 bg-amber-500 text-end", "dark:bg-dark-game-orange-top-bar-background")}>
        &nbsp;
      </div>
    </div>
  );
}
