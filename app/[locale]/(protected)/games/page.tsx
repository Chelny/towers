import { ReactNode } from "react";
import { Metadata } from "next";
import { I18n } from "@lingui/core";
import { initLingui } from "@/app/init-lingui";
import { ROUTE_GAMES } from "@/constants/routes";

type GamesProps = PageProps<"/[locale]/games">;

export async function generateMetadata({ params }: GamesProps): Promise<Metadata> {
  const { locale } = await params;
  const i18n: I18n = initLingui(locale);

  return {
    title: i18n._(ROUTE_GAMES.TITLE),
  };
}

export default function Games(): ReactNode {
  return <>TODO: List other games here</>;
}
