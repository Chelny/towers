"use client";

import { ReactNode } from "react";
import { Trans } from "@lingui/react/macro";
import { TowersTableWithRelations } from "db";
import Banner from "@/components/Banner";

type TableHeaderProps = {
  table?: TowersTableWithRelations
}

export default function TableHeader({ table }: TableHeaderProps): ReactNode {
  const tableNumber: number | undefined = table?.tableNumber;
  const tableHostUsername: string | null | undefined = table?.hostPlayer?.user?.username;

  return (
    <div className="[grid-area:banner] flex justify-between items-center gap-6">
      <div className="w-1/3 p-4">
        <h1 className="text-3xl truncate">
          <Trans>
            Table: {tableNumber} - Host: {tableHostUsername}
          </Trans>
        </h1>
        <h2 className="text-lg">{table?.room?.name}</h2>
      </div>
      <Banner />
    </div>
  );
}
