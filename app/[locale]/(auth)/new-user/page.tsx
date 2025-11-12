import { ReactNode } from "react";
import { headers } from "next/headers";
import { Metadata } from "next/types";
import { I18n } from "@lingui/core";
import { Trans } from "@lingui/react/macro";
import { ProfileForm } from "@/app/[locale]/(protected)/account/profile/profile.form";
import { initLingui } from "@/app/init-lingui";
import Anchor from "@/components/ui/Anchor";
import { ROUTE_GAMES, ROUTE_NEW_USER } from "@/constants/routes";
import { auth } from "@/lib/auth";
import { Session } from "@/lib/authClient";

type NewUserProps = {
  params: Promise<Params>
}

export async function generateMetadata({ params }: NewUserProps): Promise<Metadata> {
  const routeParams: Params = await params;
  const i18n: I18n = initLingui(routeParams.locale);

  return {
    title: i18n._(ROUTE_NEW_USER.TITLE),
  };
}

export default async function NewUser({ params }: NewUserProps): Promise<ReactNode> {
  const routeParams: Params = await params;
  const i18n: I18n = initLingui(routeParams.locale);
  const session: Session | null = await auth.api.getSession({ headers: await headers() });

  return (
    <>
      <h1 className="mb-4 text-3xl">{i18n._(ROUTE_NEW_USER.TITLE)}</h1>
      <ProfileForm session={session} isNewUser />
      <div className="mt-4 text-center">
        <Anchor href={ROUTE_GAMES.PATH}>
          <Trans>Skip this step</Trans>
        </Anchor>
      </div>
    </>
  );
}
