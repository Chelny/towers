import { ReactNode } from "react";
import { Metadata } from "next";
import { headers } from "next/headers";
import { I18n } from "@lingui/core";
import { SettingsForm } from "@/app/[locale]/(protected)/account/settings/settings.form";
import { initLingui } from "@/app/init-lingui";
import { ROUTE_SETTINGS } from "@/constants/routes";
import { auth } from "@/lib/auth";
import { Session } from "@/lib/auth-client";

type SettingsProps = {
  params: Promise<Params>
};

export async function generateMetadata({ params }: SettingsProps): Promise<Metadata> {
  const routeParams: Params = await params;
  const i18n: I18n = initLingui(routeParams.locale);

  return {
    title: i18n._(ROUTE_SETTINGS.TITLE),
  };
}

export default async function Settings({ params }: SettingsProps): Promise<ReactNode> {
  const routeParams: Params = await params;
  const i18n: I18n = initLingui(routeParams.locale);
  const session: Session | null = await auth.api.getSession({ headers: await headers() });

  return (
    <>
      <h1 className="mb-4 text-3xl">{i18n._(ROUTE_SETTINGS.TITLE)}</h1>
      <SettingsForm session={session} />
    </>
  );
}
