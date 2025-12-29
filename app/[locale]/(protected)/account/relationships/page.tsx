import { ReactNode, Suspense } from "react";
import { Metadata } from "next";
import { headers } from "next/headers";
import { I18n } from "@lingui/core";
import clsx from "clsx/lite";
import { Relationships } from "@/app/[locale]/(protected)/account/relationships/Relationships";
import { initLingui } from "@/app/init-lingui";
import { ROUTE_RELATIONSHIPS } from "@/constants/routes";
import { auth } from "@/lib/auth";
import { Session } from "@/lib/auth-client";

type PrivacyProps = PageProps<"/[locale]/account/relationships">;

export async function generateMetadata({ params }: PrivacyProps): Promise<Metadata> {
  const { locale } = await params;
  const i18n: I18n = initLingui(locale);

  return {
    title: i18n._(ROUTE_RELATIONSHIPS.TITLE),
  };
}

export default async function Privacy({ params }: PrivacyProps): Promise<ReactNode> {
  const { locale } = await params;
  const i18n: I18n = initLingui(locale);
  const session: Session | null = await auth.api.getSession({ headers: await headers() });

  return (
    <>
      <h1 className="mb-4 text-3xl">{i18n._(ROUTE_RELATIONSHIPS.TITLE)}</h1>
      <div className="flex flex-col gap-6">
        <section
          className={clsx(
            "p-4 border border-gray-200 rounded-lg shadow-xs bg-gray-50",
            "dark:border-dark-card-border dark:bg-dark-card-background",
          )}
        >
          <Suspense fallback={<></>}>
            <Relationships session={session} />
          </Suspense>
        </section>
      </div>
    </>
  );
}
